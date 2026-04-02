import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { TeacherEntity } from '../../../teachers/domain/entities/teacher.entity';
import { EnrollmentEntity } from './enrollment.entity';

@Entity('subjects')
export class SubjectEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: 0 })
  creditos: number;

  @ManyToOne(() => TeacherEntity, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: TeacherEntity;

  @OneToMany(() => EnrollmentEntity, (e) => e.subject)
  enrollments: EnrollmentEntity[];

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
