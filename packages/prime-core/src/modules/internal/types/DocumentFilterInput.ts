import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class DocumentFilterInput {
  @Field(type => ID, { nullable: true })
  public releaseId: string;

  @Field(type => ID, { nullable: true })
  public schemaId: string;

  @Field(type => ID, { nullable: true })
  public userId: string;

  @Field({ nullable: true })
  public locale: string;
}
