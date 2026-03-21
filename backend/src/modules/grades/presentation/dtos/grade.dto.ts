import { IsInt, IsPositive, IsNumber, Min, Max, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGradeDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  enrollment_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  parcial: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacion: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;
}
