import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from '../../../../common/cloudinary/cloudinary.service';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { SystemConfigEntity } from '../../domain/entities/system-config.entity';
import { UpdateSystemConfigDto } from '../dtos/system-config.dto';

const ALLOWED_KEYS = [
  'primary_color',
  'login_bg_url',
  'theme_mode',
  'icon_set',
];

@Controller('system-config')
export class SystemConfigController {
  constructor(
    @InjectRepository(SystemConfigEntity)
    private configRepo: Repository<SystemConfigEntity>,
    private cloudinary: CloudinaryService,
  ) {}

  /** GET /system-config — público, sin autenticación */
  @Get()
  async getConfig(): Promise<Record<string, string | null>> {
    const rows = await this.configRepo.find();
    return rows.reduce<Record<string, string | null>>((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  }

  /** PUT /system-config — solo admin */
  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateConfig(@Body() dto: UpdateSystemConfigDto): Promise<Record<string, string | null>> {
    for (const [key, value] of Object.entries(dto.config)) {
      if (!ALLOWED_KEYS.includes(key)) continue;
      let row = await this.configRepo.findOne({ where: { key } });
      if (!row) {
        row = this.configRepo.create({ key, value });
      } else {
        row.value = value;
      }
      await this.configRepo.save(row);
    }
    return this.getConfig();
  }

  /** POST /system-config/login-bg — solo admin, sube imagen de fondo del login */
  @Post('login-bg')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        if (!allowed.includes(extname(file.originalname).toLowerCase())) {
          return cb(new BadRequestException('Solo se permiten imágenes JPG, PNG o WebP'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadLoginBg(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió archivo');
    const login_bg_url = await this.cloudinary.uploadImage(
      file.buffer,
      'erp/login-bg/login-bg',
    );
    let row = await this.configRepo.findOne({ where: { key: 'login_bg_url' } });
    if (!row) {
      row = this.configRepo.create({ key: 'login_bg_url', value: login_bg_url });
    } else {
      row.value = login_bg_url;
    }
    await this.configRepo.save(row);
    return { login_bg_url };
  }
}
