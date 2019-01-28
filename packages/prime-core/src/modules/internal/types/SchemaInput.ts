import { Field, InputType } from 'type-graphql';
import { SchemaVariant } from '../../../entities/Schema';
import { GraphQLJSON } from './../../../types/GraphQLJSON';
import { SchemaFieldGroup } from './SchemaFieldGroup';

@InputType()
export class SchemaInput {
  @Field()
  public name: string;

  @Field()
  public title: string;

  @Field({ nullable: true })
  public description?: string;

  @Field(type => SchemaVariant)
  public variant: SchemaVariant;

  @Field(type => GraphQLJSON, { nullable: true })
  public settings: any;

  @Field(type => [SchemaFieldGroup], { nullable: true })
  public fields: SchemaFieldGroup;
}
