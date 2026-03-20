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
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { TeacherEntity } from '../../domain/entities/teacher.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { RoleEntity } from '../../../users/domain/entities/role.entity';
import { SubjectEntity } from '../../../subjects/domain/entities/subject.entity';
import { CreateTeacherDto, UpdateTeacherDto } from '../dtos/teacher.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeacherController {
  constructor(
    @InjectRepository(TeacherEntity)
    private teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
    @InjectRepository(SubjectEntity)
    private subjectRepo: Repository<SubjectEntity>,
  ) {}

  @Get()
  @Roles('admin', 'maestro')
  findAll() {
    return this.teacherRepo.find({ relations: ['user', 'user.role'] });
  }

  @Get(':id')
  @Roles('admin', 'maestro')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const t = await this.teacherRepo.findOne({ where: { id }, relations: ['user', 'user.role'] });
    if (!t) throw new NotFoundException('Maestro no encontrado');
    return t;
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateTeacherDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email ya registrado');

    const role = await this.roleRepo.findOne({ where: { name: 'maestro' } });
    if (!role) throw new NotFoundException('Rol maestro no encontrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ nombre: dto.nombre, email: dto.email, password_hash: hash, role, activo: true });
    const savedUser = await this.userRepo.save(user);

    const teacher = this.teacherRepo.create({ user: savedUser, especialidad: dto.especialidad });
    return this.teacherRepo.save(teacher);
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeacherDto) {
    const teacher = await this.teacherRepo.findOne({ where: { id }, relations: ['user'] });
    if (!teacher) throw new NotFoundException('Maestro no encontrado');

    if (dto.nombre) teacher.user.nombre = dto.nombre;
    if (dto.email && dto.email !== teacher.user.email) {
      const ex = await this.userRepo.findOne({ where: { email: dto.email } });
      if (ex) throw new ConflictException('Email ya registrado');
      teacher.user.email = dto.email;
    }
    if (dto.especialidad) teacher.especialidad = dto.especialidad;

    await this.userRepo.save(teacher.user);
    return this.teacherRepo.save(teacher);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const teacher = await this.teacherRepo.findOne({ where: { id } });
    if (!teacher) throw new NotFoundException('Maestro no encontrado');
    await this.teacherRepo.remove(teacher);
    return { message: 'Maestro eliminado' };
  }

  @Get(':id/subjects')
  @Roles('admin', 'maestro')
  async getSubjects(@Param('id', ParseIntPipe) id: number) {
    const teacher = await this.teacherRepo.findOne({ where: { id } });
    if (!teacher) throw new NotFoundException('Maestro no encontrado');
    return this.subjectRepo.find({ where: { teacher: { id } }, relations: ['teacher', 'teacher.user'] });
  }
}
