import { Field, InputType } from 'type-graphql';

@InputType()
export class UpdateUserInput {
  @Field(type => String, { nullable: true })
  public firstname: string;

  @Field(type => String, { nullable: true })
  public lastname: string;

  @Field(type => String, { nullable: true })
  public displayName: string;

  @Field(type => String, { nullable: true })
  public avatarUrl: string;
}
