import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line no-submodule-imports
import { ApolloClient } from 'apollo-boost';
import { GraphQLFieldConfig, GraphQLInputObjectType, GraphQLInputType } from 'graphql';
import { defaultsDeep } from 'lodash';

interface IField {
  id: string;
  name: string;
  title: string;
  type: string;
  group: string;
  position: number;
  contentTypeId: string;
  contentTypeFieldId: string;
  options: any; // tslint:disable-line no-any
}

interface IContentType {
  id: string;
  name: string;
  title: string;
  isSlice: boolean;
  contentEntry: any; // tslint:disable-line no-any
  fields: any[]; // tslint:disable-line no-any
}

export interface IPrimeFieldProps {
  initialValue?: string;
  field: IField;
  form: FormComponentProps['form'];
  client: typeof ApolloClient;
  stores: {
    Auth: any; // tslint:disable-line no-any
    Settings: any; // tslint:disable-line no-any
    ContentEntries: any; // tslint:disable-line no-any
    ContentTypes: any; // tslint:disable-line no-any
    Users: any; // tslint:disable-line no-any
  };
  entry: {
    entryId: string;
    data: object;
  };
  path: string;
  renderField(args: IPrimeFieldProps): React.ReactNode;
}

export interface IPrimeFieldGraphQLArguments {
  field: IField;
  queries: {
    [key: string]: any; // tslint:disable-line no-any
  };
  contentType: IContentType;
  contentTypes: IContentType[];
  resolveFieldType: Function;
  isUpdate: boolean;
}

type IPrimeFieldGraphQLOutput = null | GraphQLFieldConfig<any, any>; // tslint:disable-line no-any

type IPrimeFieldGraphQLInput = null | {
  type: GraphQLInputType | GraphQLInputObjectType;
};

interface IRegisterField {
  InputComponent?: React.ReactNode;
  SchemaSettingsComponent?: React.ReactNode;
  SchemaDisplayComponent?: React.ReactNode;
}

/**
 * Abstract Field class for Prime CMS
 */
export abstract class PrimeField {

  /**
   * Field identifier (alphanumeric string)
   * Has to be unique
   * @example 'my-field'
   */
  public abstract id: string;

  /**
   * Field title (Display name)
   */
  public abstract title: string;

  /**
   * Describe what the field does
   */
  public abstract description: string;

  /**
   * Default options
   */
  public defaultOptions = {};

  /**
   * Return a object that can be used as GraphQL type
   * @param args All the necessery things you will need from Prime Core
   */
  public abstract getGraphQLOutput(args: IPrimeFieldGraphQLArguments): IPrimeFieldGraphQLOutput;

  /**
   * Return a object that can be used as GraphQL input type
   * @param args All the necessery things you will need from Prime Core
   */
  public abstract getGraphQLInput(args: IPrimeFieldGraphQLArguments): IPrimeFieldGraphQLInput;

  /**
   * Return a object that can be used as GraphQL input type to query the field via `where`
   * @param args All the necessery things you will need from Prime Core
   */
  public abstract getGraphQLWhere(args: IPrimeFieldGraphQLArguments): IPrimeFieldGraphQLInput;

  /**
   * Process input data
   * @param input Object for input
   */
  public processInput(input) {
    return input;
  }

  /**
   * Process output data
   * @param output Object for output
   */
  public processOutput(output) {
    return output;
  }

  public getOptions(field: IField) {
    return defaultsDeep(field.options, this.defaultOptions);
  }
}

export function registerField(name: string, field: IRegisterField): IRegisterField {
  if (typeof window !== 'undefined') { // tslint:disable-line no-typeof-undefined
    const win: any = window; // tslint:disable-line no-any
    if (win.prime && win.prime.registerField) { // tslint:disable-line no-unsafe-any
      win.prime.registerField(name, field); // tslint:disable-line no-unsafe-any
    }
  }

  return field;
}
