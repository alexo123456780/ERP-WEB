import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import { StudentEntity } from '../../../students/domain/entities/student.entity';
import { CreatePaymentDto, UpdatePaymentStatusDto } from '../dtos/payment.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
  ) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreatePaymentDto) {
    const student = await this.studentRepo.findOne({ where: { id: dto.student_id } });
    if (!student) throw new NotFoundException('Alumno no encontrado');

    const payment = this.paymentRepo.create({
      student,
      concepto: dto.concepto,
      monto: dto.monto,
      fecha_pago: dto.fecha_pago,
      estado: dto.estado ?? 'pendiente',
      ciclo: dto.ciclo,
    });
    return this.paymentRepo.save(payment);
  }

  @Get('student/:studentId')
  @Roles('admin', 'alumno', 'padre')
  async getByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Alumno no encontrado');

    return this.paymentRepo.find({
      where: { student: { id: studentId } },
      relations: ['student'],
      order: { ciclo: 'DESC' },
    });
  }

  @Patch(':id/status')
  @Roles('admin')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    payment.estado = dto.estado;
    if (dto.fecha_pago) payment.fecha_pago = dto.fecha_pago;
    return this.paymentRepo.save(payment);
  }

  @Get('pending')
  @Roles('admin')
  async getPending() {
    return this.paymentRepo.find({
      where: { estado: 'pendiente' },
      relations: ['student', 'student.user'],
      order: { ciclo: 'DESC' },
    });
  }
}
