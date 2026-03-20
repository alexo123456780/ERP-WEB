import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../../domain/entities/student.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { UpdateStudentDto } from '../../presentation/dtos/create-student.dto';

@Injectable()
export class UpdateStudentUseCase {
  constructor(
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async execute(id: number, dto: UpdateStudentDto) {
    const student = await this.studentRepo.findOne({ where: { id }, relations: ['user'] });
    if (!student) throw new NotFoundException('Alumno no encontrado');

    if (dto.curp && dto.curp !== student.curp) {
      const existing = await this.studentRepo.findOne({ where: { curp: dto.curp } });
      if (existing) throw new ConflictException('CURP ya registrada');
      student.curp = dto.curp;
    }

    if (dto.fecha_nacimiento) student.fecha_nacimiento = dto.fecha_nacimiento;
    if (dto.telefono) student.telefono = dto.telefono;

    if (dto.nombre) student.user.nombre = dto.nombre;
    if (dto.email) {
      if (dto.email !== student.user.email) {
        const existingEmail = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existingEmail) throw new ConflictException('Email ya registrado');
      }
      student.user.email = dto.email;
    }

    await this.userRepo.save(student.user);
    return this.studentRepo.save(student);
  }
}
