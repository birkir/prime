import { Field, ID, Int, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import GraphQLJSON from 'graphql-type-json';
import { Webhook } from './Webhook';

@Entity()
@ObjectType()
export class WebhookCall {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  public id: string;

  @Column('boolean')
  @Field(type => Boolean)
  public success: boolean;

  @Column('int')
  @Field(type => Int)
  public status: number;

  @Column('jsonb', { default: {} })
  @Field(type => GraphQLJSON)
  public request: any;

  @Column('jsonb', { nullable: true })
  @Field(type => GraphQLJSON)
  public response: any;

  @Column('timestamp')
  @Field(type => Date)
  public executedAt: Date;

  @ManyToOne(type => Webhook, webhook => webhook.calls)
  public webhook: Webhook;
}
