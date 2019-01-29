import { Field, InputType } from 'type-graphql';

@InputType()
export class DocumentFilterInput {
  @Field({ nullable: true })
  public releaseId: string;

  @Field({ nullable: true })
  public schemaId: string;

  @Field({ nullable: true })
  public userId: string;

  @Field({ nullable: true })
  public locale: string;
}
