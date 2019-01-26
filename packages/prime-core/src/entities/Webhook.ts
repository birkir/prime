import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WebhookCall } from '../models/WebhookCall';
import { User } from './User';

@Entity()
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column()
  public url: string;

  @Column({ default: 'POST' })
  public method: string;

  @Column({ type: 'jsonb', default: {} })
  public options: any;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(type => User)
  public user: User;

  @OneToMany(type => WebhookCall, call => call.webhook)
  public calls: WebhookCall[];
}
