import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { RoleEntity } from '../../../users/domain/entities/role.entity';
import { RegisterDto } from '../../presentation/dtos/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
  ) {}

  async execute(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya está registrado');

    const role = await this.roleRepo.findOne({ where: { name: dto.role as any } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      password_hash: hash,
      role,
      activo: true,
    });

    const saved = await this.userRepo.save(user);
    const { password_hash, ...result } = saved;
    return result;
  }
}
