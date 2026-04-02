import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EnrollmentEntity } from '../../../subjects/domain/entities/enrollment.entity';

@Entity('attendance')
export class AttendanceEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @ManyToOne(() => EnrollmentEntity, (e) => e.attendance)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: EnrollmentEntity;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'boolean', default: true })
  presente: boolean;

  @Column({ type: 'boolean', default: false })
  justificado: boolean;
}
