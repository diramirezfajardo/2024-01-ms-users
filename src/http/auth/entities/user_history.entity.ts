import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserHistory {
  @PrimaryGeneratedColumn({ unsigned: true })
  id?: number;

  @Column()
  userId?: number;

  @Column()
  accessToken?: string;

  @Column()
  refreshToken?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateAt?: string;

  @ManyToOne(() => User, (user) => user.id)
  user?: User;
}
