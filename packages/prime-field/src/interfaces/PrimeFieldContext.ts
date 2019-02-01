import { Schema } from './Schema';
import { SchemaField } from './SchemaField';

export interface PrimeFieldContext {
  name: string;
  fields: SchemaField[];
  resolvers: {
    [key: string]: any;
  };
  schema: Schema;
  uniqueTypeName(name: string): string;
}
