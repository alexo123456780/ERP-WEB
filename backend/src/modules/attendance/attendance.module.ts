import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceEntity } from './domain/entities/attendance.entity';
import { EnrollmentEntity } from '../subjects/domain/entities/enrollment.entity';
import { AttendanceController } from './presentation/controllers/attendance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceEntity, EnrollmentEntity])],
  controllers: [AttendanceController],
  exports: [TypeOrmModule],
})
export class AttendanceModule {}
