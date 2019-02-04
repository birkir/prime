import { Field, ObjectType } from 'type-graphql';
import { SchemaField } from '../../../entities/SchemaField';

@ObjectType()
export class SchemaFieldGroup {
  @Field()
  public title: string;

  @Field(type => [SchemaField], { nullable: true })
  public fields: SchemaField[];
}
