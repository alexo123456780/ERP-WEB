import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { StudentEntity } from '../../../students/domain/entities/student.entity';
import { SubjectEntity } from './subject.entity';
import { GradeEntity } from '../../../grades/domain/entities/grade.entity';
import { AttendanceEntity } from '../../../attendance/domain/entities/attendance.entity';

@Entity('enrollments')
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @ManyToOne(() => StudentEntity)
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  @ManyToOne(() => SubjectEntity, (s) => s.enrollments)
  @JoinColumn({ name: 'subject_id' })
  subject: SubjectEntity;

  @Column({ length: 20 })
  ciclo: string;

  @OneToMany(() => GradeEntity, (g) => g.enrollment)
  grades: GradeEntity[];

  @OneToMany(() => AttendanceEntity, (a) => a.enrollment)
  attendance: AttendanceEntity[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
