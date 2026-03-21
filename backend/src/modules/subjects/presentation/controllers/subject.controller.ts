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
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';
import { TeacherEntity } from '../../../teachers/domain/entities/teacher.entity';
import { StudentEntity } from '../../../students/domain/entities/student.entity';
import { CreateSubjectDto, UpdateSubjectDto, EnrollStudentDto } from '../dtos/subject.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectController {
  constructor(
    @InjectRepository(SubjectEntity)
    private subjectRepo: Repository<SubjectEntity>,
    @InjectRepository(EnrollmentEntity)
    private enrollmentRepo: Repository<EnrollmentEntity>,
    @InjectRepository(TeacherEntity)
    private teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
  ) {}

  @Get()
  @Roles('admin', 'maestro', 'alumno')
  findAll() {
    return this.subjectRepo.find({ where: { activo: true }, relations: ['teacher', 'teacher.user'] });
  }

  @Get(':id')
  @Roles('admin', 'maestro', 'alumno')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const s = await this.subjectRepo.findOne({ where: { id }, relations: ['teacher', 'teacher.user'] });
    if (!s) throw new NotFoundException('Materia no encontrada');
    return s;
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateSubjectDto) {
    let teacher: TeacherEntity | null = null;
    if (dto.teacher_id) {
      teacher = await this.teacherRepo.findOne({ where: { id: dto.teacher_id } });
      if (!teacher) throw new NotFoundException('Maestro no encontrado');
    }
    const subject = this.subjectRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      creditos: dto.creditos ?? 0,
      teacher: teacher ?? undefined,
    });
    return this.subjectRepo.save(subject);
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubjectDto) {
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Materia no encontrada');

    if (dto.nombre) subject.nombre = dto.nombre;
    if (dto.descripcion !== undefined) subject.descripcion = dto.descripcion;
    if (dto.creditos !== undefined) subject.creditos = dto.creditos;
    if (dto.teacher_id) {
      const teacher = await this.teacherRepo.findOne({ where: { id: dto.teacher_id } });
      if (!teacher) throw new NotFoundException('Maestro no encontrado');
      subject.teacher = teacher;
    }
    return this.subjectRepo.save(subject);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Materia no encontrada');
    subject.activo = false;
    await this.subjectRepo.save(subject);
    return { message: 'Materia desactivada' };
  }

  @Post(':id/enroll')
  @Roles('admin', 'maestro')
  async enrollStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnrollStudentDto,
  ) {
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Materia no encontrada');

    const student = await this.studentRepo.findOne({ where: { id: dto.student_id } });
    if (!student) throw new NotFoundException('Alumno no encontrado');

    const existing = await this.enrollmentRepo.findOne({
      where: { student: { id: dto.student_id }, subject: { id }, ciclo: dto.ciclo },
    });
    if (existing) throw new ConflictException('El alumno ya está inscrito en esta materia para este ciclo');

    const enrollment = this.enrollmentRepo.create({ student, subject, ciclo: dto.ciclo });
    return this.enrollmentRepo.save(enrollment);
  }

  @Get(':id/students')
  @Roles('admin', 'maestro')
  async getStudents(@Param('id', ParseIntPipe) id: number) {
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Materia no encontrada');

    return this.enrollmentRepo.find({
      where: { subject: { id } },
      relations: ['student', 'student.user'],
    });
  }
}
