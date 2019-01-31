import { GraphQLFieldConfig, GraphQLInputFieldConfig, GraphQLInputType } from 'graphql';
import { Repository } from 'typeorm';
import { Document } from '../entities/Document';
import { Schema } from '../entities/Schema';
import { SchemaField } from '../entities/SchemaField';

export interface PrimeFieldContext {
  name: string;
  fields: SchemaField[];
  resolvers: {
    [key: string]: any;
  };
  schema: Schema;
  uniqueTypeName(name: string): string;
}

export enum PrimeFieldOperation {
  READ,
  CREATE,
  UPDATE,
}

export class PrimeField {
  public type: string;
  public name: string;
  public options: any;

  constructor(
    protected schemaField: SchemaField,
    protected repositories: {
      document: Repository<Document>;
      schema: Repository<Schema>;
      schemaField: Repository<SchemaField>;
    }
  ) {}

  public outputType<TSource, TContext>(
    context: PrimeFieldContext,
    operation: PrimeFieldOperation.READ
  ):
    | Promise<GraphQLFieldConfig<TSource, TContext> | null>
    | GraphQLFieldConfig<TSource, TContext>
    | null {
    return null;
  }

  public inputType(
    context: PrimeFieldContext,
    operation: PrimeFieldOperation.CREATE | PrimeFieldOperation.UPDATE
  ): Promise<GraphQLInputFieldConfig | null> | GraphQLInputFieldConfig | null {
    return Promise.resolve(null);
  }

  public whereType(
    context: PrimeFieldContext
  ): Promise<GraphQLInputType | null> | GraphQLInputType | null {
    return Promise.resolve(null);
  }

  public processInput(data: object): Promise<object> {
    return Promise.resolve(data);
  }

  public processOutput(data: object): Promise<object> {
    return Promise.resolve(data);
  }
}
