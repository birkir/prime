import { Field, GraphQLISODateTime, InputType } from 'type-graphql';

@InputType()
export class ReleaseInput {
  @Field(type => String)
  public name: string;

  @Field(type => String, { nullable: true })
  public description?: string;

  @Field(type => GraphQLISODateTime, { nullable: true })
  public scheduledAt?: string;
}
