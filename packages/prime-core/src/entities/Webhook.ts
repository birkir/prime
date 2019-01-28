import { User } from '@accounts/typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  AfterInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { pubSub } from '../modules/internal';
import { GraphQLJSON } from '../types/GraphQLJSON';
import { WebhookCall } from './WebhookCall';

@Entity()
@ObjectType()
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  public id: string;

  @Column()
  @Field()
  public name: string;

  @Column()
  @Field()
  public url: string;

  @Column({ default: 'POST' })
  @Field()
  public method: string;

  @Column({ type: 'jsonb', default: {} })
  @Field(type => GraphQLJSON)
  public options: any;

  @CreateDateColumn()
  @Field(type => Date)
  public createdAt: Date;

  @UpdateDateColumn()
  @Field(type => Date)
  public updatedAt: Date;

  @ManyToOne(type => User)
  public user: User;

  @OneToMany(type => WebhookCall, call => call.webhook)
  public calls: WebhookCall[];

  @AfterInsert()
  public notify() {
    pubSub.publish('WEBHOOK_ADDED', this);
  }
}
