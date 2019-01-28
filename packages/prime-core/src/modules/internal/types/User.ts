import { User as AccountsUser } from '@accounts/typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { Entity } from 'typeorm';
import { GraphQLJSON } from '../../../types/GraphQLJSON';

@Entity()
@ObjectType()
export class User extends AccountsUser {
  @Field(type => ID)
  public id = super.id;

  @Field(type => GraphQLJSON, { nullable: true })
  public profile = super.profile;
}
