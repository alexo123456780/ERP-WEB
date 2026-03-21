import { IsInt, IsPositive, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttendanceDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  enrollment_id: number;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsBoolean()
  presente?: boolean;

  @IsOptional()
  @IsBoolean()
  justificado?: boolean;
}
