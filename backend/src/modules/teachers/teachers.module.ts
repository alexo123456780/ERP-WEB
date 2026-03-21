import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherEntity } from './domain/entities/teacher.entity';
import { UserEntity } from '../users/domain/entities/user.entity';
import { RoleEntity } from '../users/domain/entities/role.entity';
import { SubjectEntity } from '../subjects/domain/entities/subject.entity';
import { TeacherController } from './presentation/controllers/teacher.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherEntity, UserEntity, RoleEntity, SubjectEntity])],
  controllers: [TeacherController],
  exports: [TypeOrmModule],
})
export class TeachersModule {}
