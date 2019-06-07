import GraphQLJSON from 'graphql-type-json';
import { Field, InputType } from 'type-graphql';

@InputType()
export class UpdateUserInput {
  @Field(type => GraphQLJSON, { nullable: true })
  public profile: any;
}
