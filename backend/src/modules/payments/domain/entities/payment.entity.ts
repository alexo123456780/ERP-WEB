import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentEntity } from '../../../students/domain/entities/student.entity';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @ManyToOne(() => StudentEntity)
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  @Column({ length: 200 })
  concepto: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ name: 'fecha_pago', type: 'date', nullable: true })
  fecha_pago: string;

  @Column({ type: 'enum', enum: ['pagado', 'pendiente'], default: 'pendiente' })
  estado: 'pagado' | 'pendiente';

  @Column({ length: 20 })
  ciclo: string;
}
