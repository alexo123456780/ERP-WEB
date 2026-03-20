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

@Entity('teachers')
export class TeacherEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ length: 150, nullable: true })
  especialidad: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
