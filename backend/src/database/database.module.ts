import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { RoleEntity } from '../modules/users/domain/entities/role.entity';
import { UserEntity } from '../modules/users/domain/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, UserEntity])],
  providers: [SeedService],
})
export class DatabaseModule {}
