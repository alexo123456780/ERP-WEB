import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from '../modules/users/domain/entities/role.entity';
import { UserEntity } from '../modules/users/domain/entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedAdmin();
  }

  private async seedRoles() {
    const roles: Array<'admin' | 'maestro' | 'alumno' | 'padre'> = ['admin', 'maestro', 'alumno', 'padre'];
    for (const name of roles) {
      const exists = await this.roleRepo.findOne({ where: { name } });
      if (!exists) {
        await this.roleRepo.save(this.roleRepo.create({ name }));
        this.logger.log(`Rol "${name}" creado`);
      }
    }
  }

  private async seedAdmin() {
    const adminRole = await this.roleRepo.findOne({ where: { name: 'admin' } });
    if (!adminRole) return;

    const exists = await this.userRepo.findOne({ where: { email: 'admin@educore.mx' } });
    if (!exists) {
      const hash = await bcrypt.hash('Admin1234', 10);
      await this.userRepo.save(
        this.userRepo.create({
          nombre: 'Administrador',
          email: 'admin@educore.mx',
          password_hash: hash,
          role: adminRole,
          activo: true,
        }),
      );
      this.logger.log('Usuario admin creado: admin@educore.mx / Admin1234');
    }
  }
}
