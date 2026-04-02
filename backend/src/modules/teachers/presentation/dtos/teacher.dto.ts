import { IsString, IsEmail, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  especialidad?: string;
}

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  especialidad?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
