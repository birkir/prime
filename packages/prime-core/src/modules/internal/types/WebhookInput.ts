import { Field, InputType } from 'type-graphql';

@InputType()
export class WebhookInput {
  @Field(type => String, { nullable: true })
  public name: string;

  @Field(type => String, { nullable: true })
  public url: string;

  @Field(type => String, { nullable: true })
  public method: string;
}
