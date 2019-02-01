import GraphQLJSON from 'graphql-type-json';
import { Field, InputType } from 'type-graphql';
import { SchemaField } from '../../../entities/SchemaField';

@InputType()
export class SchemaFieldInput extends SchemaField {
  @Field({ nullable: true }) public id: string;
  @Field() public name: string;
  @Field() public title: string;
  @Field() public description: string;
  @Field() public group: string;
  @Field() public type: string;
  @Field() public position: number;
  @Field() public primary: boolean;
  @Field(type => GraphQLJSON) public options: any;
  @Field(type => SchemaFieldInput, { nullable: true })
  public fields: SchemaFieldInput[];
}
