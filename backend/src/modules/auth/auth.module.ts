import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.usecase';
import { RegisterUseCase } from './application/use-cases/register.usecase';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { UserEntity } from '../users/domain/entities/user.entity';
import { RoleEntity } from '../users/domain/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('SECRET_GUARD', 'default_secret'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, RegisterUseCase, JwtStrategy, LocalStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
