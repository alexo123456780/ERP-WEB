import { IsString, IsOptional, IsNumber, Min, IsInt, IsPositive, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubjectDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  creditos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  teacher_id?: number;
}

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  creditos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  teacher_id?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class EnrollStudentDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  student_id: number;

  @IsString()
  ciclo: string;
}
