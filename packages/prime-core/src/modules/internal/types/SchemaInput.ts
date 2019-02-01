import GraphQLJSON from 'graphql-type-json';
import { Field, InputType } from 'type-graphql';
import { SchemaVariant } from '../../../entities/Schema';
import { SchemaFieldGroupInput } from './SchemaFieldGroupInput';

@InputType()
export class SchemaInput {
  @Field({ nullable: true })
  public name: string;

  @Field({ nullable: true })
  public title: string;

  @Field({ nullable: true })
  public description?: string;

  @Field(type => SchemaVariant, { nullable: true })
  public variant: SchemaVariant;

  @Field(type => GraphQLJSON, { nullable: true })
  public settings: any;

  @Field(type => [SchemaFieldGroupInput], { nullable: true })
  public fields: SchemaFieldGroupInput;
}
