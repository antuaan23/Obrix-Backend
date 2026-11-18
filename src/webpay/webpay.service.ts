import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { WebpayPlus } from 'transbank-sdk';

import { WEBPAY_PLUS_TRANSACTION } from './webpay.provider';
import { PagoWebpay, EstadoPagoWebpay } from './entities/pago-webpay.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { SuscripcionService } from 'src/suscripcion/suscripcion.service';
import { Result } from 'src/common/interfaces/result';
import { FiltroPagosDto } from './dto/filtro-pagos.dto';

@Injectable()
export class WebpayService {
  constructor(
    @Inject(WEBPAY_PLUS_TRANSACTION)
    private readonly transaccion: InstanceType<typeof WebpayPlus.Transaction>,

    @InjectRepository(PagoWebpay)
    private readonly pagoRepository: Repository<PagoWebpay>,

    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly suscripcionService: SuscripcionService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Inicia el flujo de pago con Webpay para contratar o cambiar un Plan.
   */
  async iniciarPago(
    usuarioId: number,
    planId: number,
  ): Promise<
    Result<{
      token: string;
      url: string;
      urlFinal: string;
      buyOrder: string;
      monto: number;
    }>
  > {
    // 1. Validar que el usuario exista
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });
    if (!usuario) {
      return Result.fallo('Usuario no encontrado.');
    }

    // 2. Validar que el plan exista y esté activo
    const plan = await this.planRepository.findOne({
      where: { id: planId, activo: true },
    });
    if (!plan) {
      return Result.fallo(`El plan con ID ${planId} no existe o no está activo.`);
    }

    // 3. Generar identificadores únicos (buyOrder máx 26 caracteres para Webpay)
    const timestampShort = Date.now().toString().slice(-8);
    const buyOrder = `OBX-${usuarioId}-${timestampShort}`;
    const sessionId = `SES-${usuarioId}-${Date.now()}`;
    const amount = Math.round(Number(plan.precio_base));

    if (amount <= 0) {
      return Result.fallo('El monto del plan debe ser mayor a 0 para pagar por Webpay.');
    }

    // 4. URL de retorno donde Transbank devuelve al usuario con el token_ws
    const baseUrl =
      this.configService.get<string>('BACKEND_URL') ||
      this.configService.get<string>('APP_URL') ||
      'http://localhost:3000';
    const returnUrl = `${baseUrl.replace(/\/$/, '')}/webpay/retorno`;

    // 5. Registrar el intento de pago en la base de datos
    const nuevoPago = this.pagoRepository.create({
      buyOrder,
      sessionId,
      monto: amount,
      estado: EstadoPagoWebpay.INICIADA,
      usuario,
      plan,
    });
    const pagoGuardado = await this.pagoRepository.save(nuevoPago);

    // 6. Invocar al SDK de Transbank
    try {
      const respuestaWebpay = await this.transaccion.create(
        buyOrder,
        sessionId,
        amount,
        returnUrl,
      );

      // Guardamos el token en la transacción para rastrearlo en el retorno
      pagoGuardado.tokenWs = respuestaWebpay.token;
      await this.pagoRepository.save(pagoGuardado);

      return Result.ok(
        {
          token: respuestaWebpay.token,
          url: respuestaWebpay.url,
          urlFinal: `${respuestaWebpay.url}?token_ws=${respuestaWebpay.token}`,
          buyOrder,
          monto: amount,
        },
        'Transacción Webpay iniciada exitosamente.',
      );
    } catch (error: any) {
      pagoGuardado.estado = EstadoPagoWebpay.RECHAZADA;
      await this.pagoRepository.save(pagoGuardado);
      return Result.fallo(`Error al comunicar con Transbank: ${error.message || error}`);
    }
  }

  /**
   * Confirma la transacción cuando Transbank redirige al retorno.
   * Si es exitosa, activa o actualiza de inmediato la Suscripcion del usuario.
   */
  async confirmarPago(token: string): Promise<
    Result<{
      estado: EstadoPagoWebpay;
      buyOrder: string;
      monto: number;
      planNombre?: string;
      autorizacion?: string;
    }>
  > {
    const pago = await this.pagoRepository.findOne({
      where: { tokenWs: token },
      relations: { usuario: true, plan: true },
    });

    if (!pago) {
      return Result.fallo('No se encontró ningún registro de pago asociado a este token.');
    }

    // Idempotencia: si ya fue procesada anteriormente
    if (pago.estado === EstadoPagoWebpay.APROBADA) {
      return Result.ok(
        {
          estado: pago.estado,
          buyOrder: pago.buyOrder,
          monto: pago.monto,
          planNombre: pago.plan?.nombre,
          autorizacion: pago.codigoAutorizacion,
        },
        'Esta transacción ya fue confirmada previamente.',
      );
    }

    try {
      const commitRes: any = await this.transaccion.commit(token);

      const esAprobada =
        commitRes.status === 'AUTHORIZED' && Number(commitRes.response_code) === 0;

      if (esAprobada) {
        pago.estado = EstadoPagoWebpay.APROBADA;
        pago.codigoAutorizacion = commitRes.authorization_code;
        pago.ultimosDigitosTarjeta = commitRes.card_detail?.card_number;
        pago.tipoPago = commitRes.payment_type_code;
        pago.numeroCuotas = commitRes.installments_number ?? commitRes.shares_number ?? 0;
        await this.pagoRepository.save(pago);

        // ==========================================
        // ACTIVAR O CAMBIAR SUSCRIPCIÓN DEL USUARIO
        // ==========================================
        try {
          const resultadoCambio = await this.suscripcionService.cambiarPlan(
            pago.usuario.id,
            pago.plan.id,
          );
          if (!resultadoCambio.exitoso) {
            // Si el usuario aún no tenía una suscripción creada, la creamos
            await this.suscripcionService.crear(pago.usuario.id, pago.plan.id);
          }
        } catch (subError) {
          console.error('Error al actualizar suscripción tras pago aprobado:', subError);
        }

        return Result.ok(
          {
            estado: EstadoPagoWebpay.APROBADA,
            buyOrder: pago.buyOrder,
            monto: pago.monto,
            planNombre: pago.plan?.nombre,
            autorizacion: pago.codigoAutorizacion,
          },
          'Pago aprobado y suscripción actualizada con éxito.',
        );
      } else {
        pago.estado = EstadoPagoWebpay.RECHAZADA;
        await this.pagoRepository.save(pago);

        return Result.fallo(
          `Pago rechazado por Transbank (Código: ${commitRes.response_code}, Estado: ${commitRes.status}).`,
        );
      }
    } catch (error: any) {
      pago.estado = EstadoPagoWebpay.RECHAZADA;
      await this.pagoRepository.save(pago);
      return Result.fallo(`Error confirmando la transacción con Transbank: ${error.message || error}`);
    }
  }

  /**
   * Maneja el caso en que el usuario cancela en el formulario de Transbank (TBK_TOKEN).
   */
  async anularPago(tbkToken: string): Promise<Result<boolean>> {
    const pago = await this.pagoRepository.findOne({
      where: { tokenWs: tbkToken },
    });

    if (pago) {
      pago.estado = EstadoPagoWebpay.ANULADA;
      await this.pagoRepository.save(pago);
    }

    return Result.ok(true, 'La transacción fue cancelada por el usuario.');
  }

  /**
   * Consulta el historial de pagos de un usuario autenticado.
   */
  async obtenerHistorialUsuario(usuarioId: number): Promise<Result<PagoWebpay[]>> {
    const pagos = await this.pagoRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: { plan: true },
      order: { creadoEl: 'DESC' },
    });

    return Result.ok(pagos, 'Historial de pagos obtenido correctamente.');
  }

  /**
   * Panel Administrativo: Obtener todos los pagos con filtros avanzados,
   * paginación y métricas de recaudación.
   */
  async obtenerTodosLosPagos(filtros: FiltroPagosDto): Promise<
    Result<{
      pagos: PagoWebpay[];
      total: number;
      pagina: number;
      limite: number;
      totalPaginas: number;
      metricas: {
        totalRecaudado: number;
        totalAprobados: number;
        totalRechazados: number;
        totalAnulados: number;
        totalIniciados: number;
      };
    }>
  > {
    const {
      estado,
      buscar,
      planId,
      fechaDesde,
      fechaHasta,
      pagina = 1,
      limite = 10,
    } = filtros;

    const query = this.pagoRepository
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.usuario', 'usuario')
      .leftJoinAndSelect('pago.plan', 'plan');

    // Filtro por estado
    if (estado) {
      query.andWhere('pago.estado = :estado', { estado });
    }

    // Filtro por plan
    if (planId) {
      query.andWhere('plan.id = :planId', { planId });
    }

    // Búsqueda por texto (orden, autorización, rut, nombre, email)
    if (buscar && buscar.trim() !== '') {
      const termino = `%${buscar.trim()}%`;
      query.andWhere(
        '(pago.buyOrder ILIKE :termino OR pago.codigoAutorizacion ILIKE :termino OR usuario.rut ILIKE :termino OR usuario.nombre ILIKE :termino OR usuario.ap_paterno ILIKE :termino OR usuario.email ILIKE :termino)',
        { termino },
      );
    }

    // Rango de fechas
    if (fechaDesde) {
      query.andWhere('pago.creadoEl >= :fechaDesde', {
        fechaDesde: new Date(`${fechaDesde}T00:00:00`),
      });
    }

    if (fechaHasta) {
      query.andWhere('pago.creadoEl <= :fechaHasta', {
        fechaHasta: new Date(`${fechaHasta}T23:59:59`),
      });
    }

    // Orden y paginación
    query.orderBy('pago.creadoEl', 'DESC');
    query.skip((pagina - 1) * limite);
    query.take(limite);

    const [pagos, total] = await query.getManyAndCount();

    // Métricas globales para las tarjetas del frontend (Admin)
    const metricasRaw = await this.pagoRepository
      .createQueryBuilder('pago')
      .select([
        "COALESCE(SUM(CASE WHEN pago.estado = 'APROBADA' THEN pago.monto ELSE 0 END), 0) AS total_recaudado",
        "COUNT(CASE WHEN pago.estado = 'APROBADA' THEN 1 END) AS total_aprobados",
        "COUNT(CASE WHEN pago.estado = 'RECHAZADA' THEN 1 END) AS total_rechazados",
        "COUNT(CASE WHEN pago.estado = 'ANULADA' THEN 1 END) AS total_anulados",
        "COUNT(CASE WHEN pago.estado = 'INICIADA' THEN 1 END) AS total_iniciados",
      ])
      .getRawOne();

    const metricas = {
      totalRecaudado: Number(metricasRaw?.total_recaudado || 0),
      totalAprobados: Number(metricasRaw?.total_aprobados || 0),
      totalRechazados: Number(metricasRaw?.total_rechazados || 0),
      totalAnulados: Number(metricasRaw?.total_anulados || 0),
      totalIniciados: Number(metricasRaw?.total_iniciados || 0),
    };

    return Result.ok(
      {
        pagos,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
        metricas,
      },
      'Lista de pagos recuperada exitosamente.',
    );
  }
}
