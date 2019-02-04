import { GraphQLFieldConfig, GraphQLInputFieldConfig, GraphQLInputType } from 'graphql';
import { defaultsDeep } from 'lodash';
import { Repository } from 'typeorm';
import { Document } from './interfaces/Document';
import { PrimeFieldContext } from './interfaces/PrimeFieldContext';
import { PrimeFieldOperation } from './interfaces/PrimeFieldOperation';
import { Schema } from './interfaces/Schema';
import { SchemaField } from './interfaces/SchemaField';

export class PrimeField {
  public static type: string;
  public static title: string;
  public static description: string;
  public static options: any = {};

  constructor(
    protected schemaField: SchemaField,
    protected repositories: {
      document: Repository<Document>;
      schema: Repository<Schema>;
      schemaField: Repository<SchemaField>;
    }
  ) {}

  public get options() {
    const defaults = Object.getPrototypeOf(this).constructor.options;
    return defaultsDeep(this.schemaField.options, defaults);
  }

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

  public processInput(data: any): Promise<any> {
    return Promise.resolve(data);
  }

  public processOutput(data: any): Promise<any> {
    return Promise.resolve(data);
  }
}
