import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './domain/entities/user.entity';
import { RoleEntity } from './domain/entities/role.entity';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity])],
  controllers: [UserController],
  exports: [TypeOrmModule],
})
export class UsersModule {}
