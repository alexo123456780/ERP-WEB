import { IsEmail, IsString, MinLength, IsIn, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['admin', 'maestro', 'alumno', 'padre'])
  role: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
