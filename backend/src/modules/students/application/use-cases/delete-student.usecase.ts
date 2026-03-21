import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../../domain/entities/student.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class DeleteStudentUseCase {
  constructor(
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async execute(id: number) {
    const student = await this.studentRepo.findOne({ where: { id }, relations: ['user'] });
    if (!student) throw new NotFoundException('Alumno no encontrado');
    student.user.activo = false;
    await this.userRepo.save(student.user);
    return { message: 'Alumno desactivado' };
  }
}
