import { Field, InputType } from 'type-graphql';
import { SchemaFieldInput } from './SchemaFieldInput';

@InputType()
export class SchemaFieldGroupInput {
  @Field()
  public title: string;

  @Field(type => [SchemaFieldInput], { nullable: true })
  public fields: SchemaFieldInput[];
}
