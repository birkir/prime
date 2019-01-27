import { Field, ID, ObjectType } from 'type-graphql';
import { Entity } from 'typeorm';
import { WebhookCall as WebhookCallEntity } from '../../../entities/WebhookCall';

@Entity()
@ObjectType()
export class WebhookCall extends WebhookCallEntity {
  @Field(type => ID)
  public id = super.id;
}
