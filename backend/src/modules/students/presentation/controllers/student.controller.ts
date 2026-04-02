import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateStudentUseCase } from '../../application/use-cases/create-student.usecase';
import { UpdateStudentUseCase } from '../../application/use-cases/update-student.usecase';
import { GetStudentsUseCase } from '../../application/use-cases/get-students.usecase';
import { DeleteStudentUseCase } from '../../application/use-cases/delete-student.usecase';
import { CreateStudentDto, UpdateStudentDto } from '../dtos/create-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from '../../../subjects/domain/entities/enrollment.entity';
import { GradeEntity } from '../../../grades/domain/entities/grade.entity';
import { AttendanceEntity } from '../../../attendance/domain/entities/attendance.entity';
import { NotFoundException } from '@nestjs/common';
import { StudentEntity } from '../../domain/entities/student.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(
    private createUC: CreateStudentUseCase,
    private updateUC: UpdateStudentUseCase,
    private getUC: GetStudentsUseCase,
    private deleteUC: DeleteStudentUseCase,
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    @InjectRepository(EnrollmentEntity)
    private enrollmentRepo: Repository<EnrollmentEntity>,
  ) {}

  @Get()
  @Roles('admin', 'maestro')
  async findAll(@Query('activo') activo?: string, @Query('search') search?: string) {
    const filter = activo !== undefined ? activo === 'true' : undefined;
    return this.getUC.findAll(filter, search);
  }

  @Get(':id')
  @Roles('admin', 'maestro', 'alumno', 'padre')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getUC.findOne(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateStudentDto) {
    return this.createUC.execute(dto);
  }

  @Patch(':id')
  @Roles('admin', 'maestro')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.updateUC.execute(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.deleteUC.execute(id);
  }

  @Get(':id/history')
  @Roles('admin', 'maestro', 'alumno', 'padre')
  async getHistory(@Param('id', ParseIntPipe) id: number) {
    const student = await this.studentRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Alumno no encontrado');

    const enrollments = await this.enrollmentRepo.find({
      where: { student: { id } },
      relations: ['subject', 'grades', 'attendance'],
    });

    return enrollments.map((e) => ({
      ciclo: e.ciclo,
      subject: e.subject,
      grades: e.grades,
      attendance: {
        total: e.attendance?.length ?? 0,
        presentes: e.attendance?.filter((a) => a.presente).length ?? 0,
        ausentes: e.attendance?.filter((a) => !a.presente).length ?? 0,
      },
    }));
  }
}
