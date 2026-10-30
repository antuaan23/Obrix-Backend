import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateSuscripcionDto {
    @ApiProperty({ description: 'ID del plan elegido', example: 1 })
    @IsInt()
    @IsNotEmpty()
    planId!: number;
}

