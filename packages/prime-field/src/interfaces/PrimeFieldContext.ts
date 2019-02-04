import { GraphQLFieldConfig } from 'graphql';
import { Schema } from './Schema';
import { SchemaField } from './SchemaField';

export interface PrimeFieldContext {
  name: string;
  fields: SchemaField[];
  types: Map<string, GraphQLFieldConfig<any, {}>>;
  resolvers: {
    [key: string]: any;
  };
  schema: Schema;
  schemas: Schema[];
  uniqueTypeName(name: string): string;
}
