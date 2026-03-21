import { IsInt, IsPositive, IsString, IsNumber, Min, IsDateString, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  student_id: number;

  @IsString()
  concepto: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monto: number;

  @IsOptional()
  @IsDateString()
  fecha_pago?: string;

  @IsOptional()
  @IsIn(['pagado', 'pendiente'])
  estado?: 'pagado' | 'pendiente';

  @IsString()
  ciclo: string;
}

export class UpdatePaymentStatusDto {
  @IsIn(['pagado', 'pendiente'])
  estado: 'pagado' | 'pendiente';

  @IsOptional()
  @IsDateString()
  fecha_pago?: string;
}
