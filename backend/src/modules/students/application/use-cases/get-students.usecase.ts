import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../../domain/entities/student.entity';

@Injectable()
export class GetStudentsUseCase {
  constructor(
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
  ) {}

  async findAll() {
    return this.studentRepo.find({ relations: ['user', 'user.role'] });
  }

  async findOne(id: number) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['user', 'user.role'],
    });
    if (!student) throw new NotFoundException('Alumno no encontrado');
    return student;
  }
}
