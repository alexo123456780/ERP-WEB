import { IsEmail, IsString, MinLength, IsIn, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe incluir al menos una letra mayúscula' })
  @Matches(/[a-z]/, { message: 'La contraseña debe incluir al menos una letra minúscula' })
  @Matches(/\d/, { message: 'La contraseña debe incluir al menos un número' })
  @Matches(/[!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/, { message: 'La contraseña debe incluir al menos un carácter especial' })
  password: string;

  @IsIn(['admin', 'maestro', 'alumno', 'padre'])
  role: string;
}
