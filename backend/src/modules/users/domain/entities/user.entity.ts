import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @ManyToOne(() => RoleEntity, (role) => role.users, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
