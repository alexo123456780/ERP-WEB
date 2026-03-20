import { Controller, Post, Body } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { RegisterUseCase } from '../../application/use-cases/register.usecase';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.login(dto.email, dto.password);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }
}
