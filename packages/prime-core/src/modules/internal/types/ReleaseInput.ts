import { Field, InputType } from 'type-graphql';

@InputType()
export class ReleaseInput {
  @Field(type => String)
  public name: string;

  @Field(type => String, { nullable: true })
  public description?: string;

  @Field(type => String, { nullable: true })
  public scheduledAt?: string;
}
