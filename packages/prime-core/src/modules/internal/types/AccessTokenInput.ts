import { Field, InputType } from 'type-graphql';

@InputType()
export class AccessTokenInput {
  @Field(type => String, { nullable: true })
  public name: string;
}
