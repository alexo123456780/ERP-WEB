import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeEntity } from './domain/entities/grade.entity';
import { EnrollmentEntity } from '../subjects/domain/entities/enrollment.entity';
import { GradeController } from './presentation/controllers/grade.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GradeEntity, EnrollmentEntity])],
  controllers: [GradeController],
  exports: [TypeOrmModule],
})
export class GradesModule {}
