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

  @Column({ type: 'tinyint', default: 1 })
  presente: boolean;

  @Column({ type: 'tinyint', default: 0 })
  justificado: boolean;
}
