import {
  Controller,
  Get,
  Post,
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
import { GradeEntity } from '../../domain/entities/grade.entity';
import { EnrollmentEntity } from '../../../subjects/domain/entities/enrollment.entity';
import { CreateGradeDto } from '../dtos/grade.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradeController {
  constructor(
    @InjectRepository(GradeEntity)
    private gradeRepo: Repository<GradeEntity>,
    @InjectRepository(EnrollmentEntity)
    private enrollmentRepo: Repository<EnrollmentEntity>,
  ) {}

  @Post()
  @Roles('admin', 'maestro')
  async create(@Body() dto: CreateGradeDto) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: dto.enrollment_id } });
    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');

    const existing = await this.gradeRepo.findOne({
      where: { enrollment: { id: dto.enrollment_id }, parcial: dto.parcial },
    });
    if (existing) throw new ConflictException('Calificación ya registrada para este parcial');

    const grade = this.gradeRepo.create({
      enrollment,
      parcial: dto.parcial,
      calificacion: dto.calificacion,
      fecha: dto.fecha ?? new Date().toISOString().split('T')[0],
    });
    return this.gradeRepo.save(grade);
  }

  @Get('student/:studentId')
  @Roles('admin', 'maestro', 'alumno', 'padre')
  async getByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.gradeRepo.find({
      where: { enrollment: { student: { id: studentId } } },
      relations: ['enrollment', 'enrollment.subject'],
    });
  }

  @Get('subject/:subjectId')
  @Roles('admin', 'maestro')
  async getBySubject(@Param('subjectId', ParseIntPipe) subjectId: number) {
    return this.gradeRepo.find({
      where: { enrollment: { subject: { id: subjectId } } },
      relations: ['enrollment', 'enrollment.student', 'enrollment.student.user'],
    });
  }

  @Get('student/:studentId/average')
  @Roles('admin', 'maestro', 'alumno', 'padre')
  async getAverage(@Param('studentId', ParseIntPipe) studentId: number) {
    const grades = await this.gradeRepo.find({
      where: { enrollment: { student: { id: studentId } } },
      relations: ['enrollment', 'enrollment.subject'],
    });

    if (!grades.length) return { average: 0, total: 0 };

    const sum = grades.reduce((acc, g) => acc + Number(g.calificacion), 0);
    return {
      average: +(sum / grades.length).toFixed(2),
      total: grades.length,
      grades,
    };
  }
}
