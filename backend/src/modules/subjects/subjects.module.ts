import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectEntity } from './domain/entities/subject.entity';
import { EnrollmentEntity } from './domain/entities/enrollment.entity';
import { TeacherEntity } from '../teachers/domain/entities/teacher.entity';
import { StudentEntity } from '../students/domain/entities/student.entity';
import { SubjectController } from './presentation/controllers/subject.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectEntity, EnrollmentEntity, TeacherEntity, StudentEntity])],
  controllers: [SubjectController],
  exports: [TypeOrmModule],
})
export class SubjectsModule {}
