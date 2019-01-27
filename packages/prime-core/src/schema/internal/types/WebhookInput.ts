import { Field, InputType } from 'type-graphql';

@InputType()
export class WebhookInput {
  @Field(type => String)
  public name: string;

  @Field(type => String)
  public url: string;

  @Field(type => String)
  public method: string;
}
