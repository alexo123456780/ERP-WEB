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

  async findAll(activo?: boolean, search?: string) {
    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('user.role', 'role');

    if (activo !== undefined) {
      qb.andWhere('user.activo = :activo', { activo });
    }
    if (search) {
      qb.andWhere(
        '(user.nombre LIKE :q OR user.email LIKE :q OR student.curp LIKE :q OR student.telefono LIKE :q)',
        { q: `%${search}%` },
      );
    }

    return qb.getMany();
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
