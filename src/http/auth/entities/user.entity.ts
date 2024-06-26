import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { userTypesEnum } from '../enums/userTypes.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id?: number;

  @Column()
  name?: string;

  @Column()
  lastName?: string;

  @Column({ unique: true })
  email?: string;

  @Column()
  password?: string;

  @Column()
  birthdate?: string;

  @Column({ default: userTypesEnum.Normal })
  userType?: number;

  @Column({ default: true })
  active?: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateAt?: string;
}
