import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { StudentEntity } from '../../domain/entities/student.entity';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { RoleEntity } from '../../../users/domain/entities/role.entity';
import { CreateStudentDto } from '../../presentation/dtos/create-student.dto';

@Injectable()
export class CreateStudentUseCase {
  constructor(
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
  ) {}

  async execute(dto: CreateStudentDto) {
    const existingEmail = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('El email ya está registrado');

    const existingCurp = await this.studentRepo.findOne({ where: { curp: dto.curp } });
    if (existingCurp) throw new ConflictException('La CURP ya está registrada');

    const role = await this.roleRepo.findOne({ where: { name: 'alumno' } });
    if (!role) throw new NotFoundException('Rol alumno no encontrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      password_hash: hash,
      role,
      activo: true,
    });
    const savedUser = await this.userRepo.save(user);

    const student = this.studentRepo.create({
      user: savedUser,
      curp: dto.curp,
      fecha_nacimiento: dto.fecha_nacimiento,
      telefono: dto.telefono,
    });

    return this.studentRepo.save(student);
  }
}
