import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EnrollmentEntity } from '../../../subjects/domain/entities/enrollment.entity';

@Entity('grades')
export class GradeEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @ManyToOne(() => EnrollmentEntity, (e) => e.grades)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: EnrollmentEntity;

  @Column({ type: 'tinyint', unsigned: true })
  parcial: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  calificacion: number;

  @Column({ type: 'date' })
  fecha: string;
}
