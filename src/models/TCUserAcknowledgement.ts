import {
  BaseEntity,
  Entity,
  ManyToOne,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm-plus';
import { User } from './User';
import { Organisation } from './Organisation';
import { IsNumber } from 'class-validator';

@Entity('tcUserAcknowledgement', { database: 'wsa_users' })
export class TCUserAcknowledgement extends BaseEntity {
  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number;

  @IsNumber()
  @Column()
  organisationId: number;

  @IsNumber()
  @Column()
  userId: number;

  @ManyToOne(type => Organisation)
  organisation: Organisation;

  @ManyToOne(type => User, { eager: true })
  @JoinColumn()
  user: User;
}
