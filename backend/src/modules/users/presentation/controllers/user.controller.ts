import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { RoleEntity } from '../../domain/entities/role.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
  ) {}

  @Get()
  @Roles('admin')
  async findAll() {
    return this.userRepo.find({ relations: ['role'], select: { password_hash: false } as any });
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { password_hash, ...result } = user;
    return result;
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email ya registrado');

    const role = await this.roleRepo.findOne({ where: { name: dto.role as any } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ nombre: dto.nombre, email: dto.email, password_hash: hash, role, activo: true });
    const saved = await this.userRepo.save(user);
    const { password_hash, ...result } = saved;
    return result;
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    const { password_hash, ...result } = saved;
    return result;
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.userRepo.remove(user);
    return { message: 'Usuario eliminado' };
  }
}
