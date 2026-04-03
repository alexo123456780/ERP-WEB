import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigEntity } from './domain/entities/system-config.entity';
import { SystemConfigController } from './presentation/controllers/system-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfigEntity])],
  controllers: [SystemConfigController],
  exports: [TypeOrmModule],
})
export class SystemConfigModule {}
