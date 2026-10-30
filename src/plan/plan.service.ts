import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Result } from 'src/common/interfaces/result';

@Injectable()
export class PlanService implements OnModuleInit {

    constructor(
        @InjectRepository(Plan)
        private readonly planRepository: Repository<Plan>,
    ) { }

    /** Seed inicial: crea los planes base si la tabla está vacía */
    async onModuleInit() {
        const count = await this.planRepository.count();
        if (count === 0) {
            await this.planRepository.save([
                {
                    nombre: 'Independiente',
                    precio_base: 5750,
                    proyectos_incluidos: 20,
                    trabajadores_incluidos: 4,
                    clientes_incluidos: null,
                    precio_extra_proyecto: 2500,
                    precio_extra_trabajador: 2000,
                    precio_extra_cliente: null,
                    activo: true,
                },
                {
                    nombre: 'Pyme',
                    precio_base: 9990,
                    proyectos_incluidos: 100,
                    trabajadores_incluidos: null,
                    clientes_incluidos: 50,
                    precio_extra_proyecto: 2500,
                    precio_extra_trabajador: 2000,
                    precio_extra_cliente: null,
                    activo: true,
                },
            ]);
            console.log('[PlanService] Planes base creados correctamente.');
        }
    }

    async findAll(): Promise<Result<Plan[]>> {
        const planes = await this.planRepository.find({ where: { activo: true }, order: { precio_base: 'ASC' } });
        return Result.ok(planes, 'Planes obtenidos correctamente.');
    }

    async findOne(id: number): Promise<Result<Plan>> {
        const plan = await this.planRepository.findOne({ where: { id } });
        if (!plan) return Result.fallo<Plan>('Plan no encontrado.');
        return Result.ok(plan, 'Plan encontrado.');
    }

    async create(dto: CreatePlanDto): Promise<Result<Plan>> {
        const nuevo = this.planRepository.create(dto);
        const guardado = await this.planRepository.save(nuevo);
        return Result.ok(guardado, 'Plan creado correctamente.');
    }

    async update(id: number, dto: UpdatePlanDto): Promise<Result<Plan>> {
        const plan = await this.planRepository.findOne({ where: { id } });
        if (!plan) return Result.fallo<Plan>('Plan no encontrado.');

        Object.assign(plan, dto);
        const actualizado = await this.planRepository.save(plan);
        return Result.ok(actualizado, 'Plan actualizado correctamente.');
    }

    async remove(id: number): Promise<Result<boolean>> {
        const plan = await this.planRepository.findOne({ where: { id } });
        if (!plan) return Result.fallo<boolean>('Plan no encontrado.');

        plan.activo = false;
        await this.planRepository.save(plan);
        return Result.ok(true, 'Plan desactivado correctamente.');
    }
}

