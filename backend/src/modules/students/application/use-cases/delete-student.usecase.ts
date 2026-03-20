import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../../domain/entities/student.entity';

@Injectable()
export class DeleteStudentUseCase {
  constructor(
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
  ) {}

  async execute(id: number) {
    const student = await this.studentRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Alumno no encontrado');
    await this.studentRepo.remove(student);
    return { message: 'Alumno eliminado' };
  }
}
