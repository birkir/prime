import GraphQLJSON from 'graphql-type-json';
import { Field, InputType } from 'type-graphql';
import { SchemaField } from '../../../entities/SchemaField';

@InputType()
export class SchemaFieldInput extends SchemaField {
  @Field({ nullable: true }) public id: string;
  @Field() public name: string;
  @Field() public title: string;
  @Field({ nullable: true }) public description: string;
  @Field() public group: string;
  @Field() public type: string;
  @Field({ nullable: true }) public position: number;
  @Field({ nullable: true }) public schemaId: string;
  @Field({ nullable: true }) public primary: boolean;
  @Field(type => GraphQLJSON, { nullable: true }) public options: any;
  @Field(type => SchemaFieldInput, { nullable: true })
  public fields: SchemaFieldInput[];
}
