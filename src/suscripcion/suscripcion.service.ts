import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suscripcion } from './entities/suscripcion.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Result } from 'src/common/interfaces/result';

export interface ResumenPlan {
    plan: {
        id: number;
        nombre: string;
        precio_base: number;
        proyectos_incluidos: number;
        trabajadores_incluidos: number | null;
        clientes_incluidos: number | null;
        precio_extra_proyecto: number | null;
        precio_extra_trabajador: number | null;
        precio_extra_cliente: number | null;
    };
    uso: {
        proyectos: number;
        trabajadores: number;
        clientes: number;
    };
    excedente: {
        proyectos: number;
        trabajadores: number;
        clientes: number;
    };
    cobro_estimado: {
        base: number;
        extra: number;
        total: number;
    };
}

@Injectable()
export class SuscripcionService {

    constructor(
        @InjectRepository(Suscripcion)
        private readonly suscripcionRepository: Repository<Suscripcion>,

        @InjectRepository(Plan)
        private readonly planRepository: Repository<Plan>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(Proyecto)
        private readonly proyectoRepository: Repository<Proyecto>,

        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
    ) { }

    /** Crea una suscripción al registrar un usuario. Llamado desde AuthService. */
    async crear(usuarioId: number, planId: number): Promise<Suscripcion> {
        const plan = await this.planRepository.findOne({ where: { id: planId, activo: true } });
        if (!plan) throw new NotFoundException(`El plan con ID ${planId} no existe o no está disponible.`);

        const suscripcion = this.suscripcionRepository.create({
            usuario: { id: usuarioId } as Usuario,
            plan,
            activa: true,
        });

        return this.suscripcionRepository.save(suscripcion);
    }

    /** Devuelve el resumen de uso y cobro estimado del mes del usuario autenticado. */
    async calcularResumen(usuarioId: number): Promise<Result<ResumenPlan>> {
        const suscripcion = await this.suscripcionRepository.findOne({
            where: { usuario: { id: usuarioId }, activa: true },
            relations: { plan: true },
        });

        if (!suscripcion) {
            return Result.fallo<ResumenPlan>('No tienes una suscripción activa.');
        }

        const plan = suscripcion.plan;

        // Contar proyectos activos donde el usuario participa (como lider/creador)
        const totalProyectos = await this.proyectoRepository
            .createQueryBuilder('proyecto')
            .innerJoin('proyecto.usuarios', 'u')
            .where('u.id = :id', { id: usuarioId })
            .andWhere('proyecto.activo = true')
            .getCount();

        // Contar trabajadores activos que dependen de este lider
        const totalTrabajadores = await this.usuarioRepository.count({
            where: { liderId: usuarioId, activo: true },
        });

        // Contar clientes activos asociados al usuario
        const totalClientes = await this.clienteRepository.count({
            where: { usuario: { id: usuarioId }, activo: true },
        });

        // Calcular excedentes (solo si el plan tiene umbral definido para esa categoría)
        const excProyectos = plan.proyectos_incluidos !== null
            ? Math.max(0, totalProyectos - plan.proyectos_incluidos) : 0;

        const excTrabajadores = plan.trabajadores_incluidos !== null
            ? Math.max(0, totalTrabajadores - plan.trabajadores_incluidos) : 0;

        const excClientes = plan.clientes_incluidos !== null
            ? Math.max(0, totalClientes - plan.clientes_incluidos) : 0;

        const cobroExtra =
            excProyectos * (plan.precio_extra_proyecto ?? 0) +
            excTrabajadores * (plan.precio_extra_trabajador ?? 0) +
            excClientes * (plan.precio_extra_cliente ?? 0);

        const resumen: ResumenPlan = {
            plan: {
                id: plan.id,
                nombre: plan.nombre,
                precio_base: plan.precio_base,
                proyectos_incluidos: plan.proyectos_incluidos,
                trabajadores_incluidos: plan.trabajadores_incluidos,
                clientes_incluidos: plan.clientes_incluidos,
                precio_extra_proyecto: plan.precio_extra_proyecto,
                precio_extra_trabajador: plan.precio_extra_trabajador,
                precio_extra_cliente: plan.precio_extra_cliente,
            },
            uso: {
                proyectos: totalProyectos,
                trabajadores: totalTrabajadores,
                clientes: totalClientes,
            },
            excedente: {
                proyectos: excProyectos,
                trabajadores: excTrabajadores,
                clientes: excClientes,
            },
            cobro_estimado: {
                base: plan.precio_base,
                extra: cobroExtra,
                total: plan.precio_base + cobroExtra,
            },
        };

        return Result.ok(resumen, 'Resumen de plan calculado correctamente.');
    }

    /** Cambia el plan activo del usuario. */
    async cambiarPlan(usuarioId: number, planId: number): Promise<Result<Suscripcion>> {
        const suscripcion = await this.suscripcionRepository.findOne({
            where: { usuario: { id: usuarioId }, activa: true },
            relations: { plan: true },
        });

        if (!suscripcion) {
            return Result.fallo<Suscripcion>('No se encontró una suscripción activa para este usuario.');
        }

        const nuevoPlan = await this.planRepository.findOne({ where: { id: planId, activo: true } });
        if (!nuevoPlan) {
            return Result.fallo<Suscripcion>(`El plan con ID ${planId} no existe o no está disponible.`);
        }

        suscripcion.plan = nuevoPlan;
        const actualizada = await this.suscripcionRepository.save(suscripcion);
        return Result.ok(actualizada, `Plan cambiado a "${nuevoPlan.nombre}" correctamente.`);
    }
}

