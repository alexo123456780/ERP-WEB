import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './domain/entities/payment.entity';
import { StudentEntity } from '../students/domain/entities/student.entity';
import { PaymentController } from './presentation/controllers/payment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, StudentEntity])],
  controllers: [PaymentController],
  exports: [TypeOrmModule],
})
export class PaymentsModule {}
