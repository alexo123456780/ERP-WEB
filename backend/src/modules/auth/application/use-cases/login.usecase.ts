import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class LoginUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return null;
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role.name,
        foto_url: user.foto_url ?? null,
      },
    };
  }
}
