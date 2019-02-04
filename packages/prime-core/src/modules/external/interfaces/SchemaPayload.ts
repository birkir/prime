import { GraphQLFieldConfig, GraphQLFieldResolver } from 'graphql';
import { Schema } from '../../../entities/Schema';
import { SchemaField } from '../../../entities/SchemaField';
import { DocumentTransformer } from '../../../utils/DocumentTransformer';
import { PrimeContext } from './PrimeContext';

export interface SchemaPayload {
  name: string;
  schema: Schema;
  schemas: Schema[];
  types: Map<string, GraphQLFieldConfig<any, any>>;
  fields: SchemaField[];
  resolvers: {
    [key: string]: GraphQLFieldResolver<{}, PrimeContext>;
  };
  documentTransformer: DocumentTransformer;
}
