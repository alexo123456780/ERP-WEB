import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'enum', enum: ['admin', 'maestro', 'alumno', 'padre'] })
  name: 'admin' | 'maestro' | 'alumno' | 'padre';

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];
}
