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
import { memoryStorage } from 'multer';
import { extname } from 'path';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../../../../common/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { RegisterUseCase } from '../../application/use-cases/register.usecase';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe incluir al menos una letra mayúscula' })
  @Matches(/[a-z]/, { message: 'La contraseña debe incluir al menos una letra minúscula' })
  @Matches(/\d/, { message: 'La contraseña debe incluir al menos un número' })
  @Matches(/[!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/, { message: 'La contraseña debe incluir al menos un carácter especial' })
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private cloudinary: CloudinaryService,
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
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        if (!allowed.includes(extname(file.originalname).toLowerCase())) {
          return cb(new BadRequestException('Tipo de archivo no permitido'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se recibió archivo');
    const user = await this.userRepo.findOne({ where: { id: req.user.id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const foto_url = await this.cloudinary.uploadImage(
      file.buffer,
      `erp/avatars/avatar_${req.user.id}`,
    );
    user.foto_url = foto_url;
    await this.userRepo.save(user);
    return { foto_url };
  }
}
