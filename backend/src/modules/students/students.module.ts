import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './domain/entities/student.entity';
import { UserEntity } from '../users/domain/entities/user.entity';
import { RoleEntity } from '../users/domain/entities/role.entity';
import { EnrollmentEntity } from '../subjects/domain/entities/enrollment.entity';
import { GradeEntity } from '../grades/domain/entities/grade.entity';
import { AttendanceEntity } from '../attendance/domain/entities/attendance.entity';
import { StudentController } from './presentation/controllers/student.controller';
import { CreateStudentUseCase } from './application/use-cases/create-student.usecase';
import { UpdateStudentUseCase } from './application/use-cases/update-student.usecase';
import { GetStudentsUseCase } from './application/use-cases/get-students.usecase';
import { DeleteStudentUseCase } from './application/use-cases/delete-student.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentEntity,
      UserEntity,
      RoleEntity,
      EnrollmentEntity,
      GradeEntity,
      AttendanceEntity,
    ]),
  ],
  controllers: [StudentController],
  providers: [CreateStudentUseCase, UpdateStudentUseCase, GetStudentsUseCase, DeleteStudentUseCase],
  exports: [TypeOrmModule],
})
export class StudentsModule {}
