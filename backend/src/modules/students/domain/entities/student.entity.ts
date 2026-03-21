import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ length: 18, unique: true })
  curp: string;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fecha_nacimiento: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
