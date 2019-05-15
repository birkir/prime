import GraphQLJSON from 'graphql-type-json';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType('PrimeField')
export class PrimeField {
  @Field(type => ID)
  public type: string;

  @Field()
  public title: string;

  @Field()
  public description: string;

  @Field(type => GraphQLJSON)
  public defaultOptions: GraphQLJSON;

  @Field()
  public ui: string;
}
