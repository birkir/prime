import GraphQLJSON from 'graphql-type-json';
import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class DocumentInput {
  @Field(type => ID, { nullable: true })
  public documentId: string;

  @Field(type => ID)
  public schemaId: string;

  @Field(type => ID, { nullable: true })
  public releaseId: string;

  @Field({ nullable: true })
  public locale: string;

  @Field(type => GraphQLJSON, { nullable: true })
  public data: any;
}
