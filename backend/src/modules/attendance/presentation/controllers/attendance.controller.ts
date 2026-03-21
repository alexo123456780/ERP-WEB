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
import { AttendanceEntity } from '../../domain/entities/attendance.entity';
import { EnrollmentEntity } from '../../../subjects/domain/entities/enrollment.entity';
import { CreateAttendanceDto } from '../dtos/attendance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(
    @InjectRepository(AttendanceEntity)
    private attendanceRepo: Repository<AttendanceEntity>,
    @InjectRepository(EnrollmentEntity)
    private enrollmentRepo: Repository<EnrollmentEntity>,
  ) {}

  @Post()
  @Roles('admin', 'maestro')
  async create(@Body() dto: CreateAttendanceDto) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: dto.enrollment_id } });
    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');

    const existing = await this.attendanceRepo.findOne({
      where: { enrollment: { id: dto.enrollment_id }, fecha: dto.fecha },
    });
    if (existing) throw new ConflictException('Asistencia ya registrada para esta fecha');

    const record = this.attendanceRepo.create({
      enrollment,
      fecha: dto.fecha,
      presente: dto.presente ?? true,
      justificado: dto.justificado ?? false,
    });
    return this.attendanceRepo.save(record);
  }

  @Get('student/:studentId')
  @Roles('admin', 'maestro', 'alumno', 'padre')
  async getByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    const records = await this.attendanceRepo.find({
      where: { enrollment: { student: { id: studentId } } },
      relations: ['enrollment', 'enrollment.subject'],
    });

    const total = records.length;
    const presentes = records.filter((r) => r.presente).length;
    const ausentes = total - presentes;
    const porcentaje = total > 0 ? +(( presentes / total) * 100).toFixed(2) : 0;

    return {
      records,
      resumen: { total, presentes, ausentes, porcentaje_asistencia: porcentaje, alerta: porcentaje < 80 },
    };
  }

  @Get('subject/:subjectId')
  @Roles('admin', 'maestro')
  async getBySubject(@Param('subjectId', ParseIntPipe) subjectId: number) {
    return this.attendanceRepo.find({
      where: { enrollment: { subject: { id: subjectId } } },
      relations: ['enrollment', 'enrollment.student', 'enrollment.student.user'],
    });
  }
}
