import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { RegisterUseCase } from '../../application/use-cases/register.usecase';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.login(dto.email, dto.password);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    const user = await this.userRepo.findOne({
      where: { id: req.user.id },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { password_hash, ...result } = user;
    return result;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: req.user.id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (dto.nombre) user.nombre = dto.nombre;
    if (dto.email) user.email = dto.email;
    if (dto.password) user.password_hash = await bcrypt.hash(dto.password, 10);
    const saved = await this.userRepo.save(user);
    const { password_hash, ...result } = saved;
    return result;
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'uploads', 'avatars'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
          if (!allowed.includes(ext.toLowerCase())) {
            return cb(new BadRequestException('Tipo de archivo no permitido'), '');
          }
          cb(null, `${(_req as any).user.id}_${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se recibió archivo');
    const user = await this.userRepo.findOne({ where: { id: req.user.id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const foto_url = `/public/uploads/avatars/${file.filename}`;
    user.foto_url = foto_url;
    await this.userRepo.save(user);
    return { foto_url };
  }
}
