import { FormComponentProps } from 'antd/lib/form';
import { ApolloClient } from 'apollo-boost';
import { GraphQLFieldConfig, GraphQLInputObjectType, GraphQLInputType } from 'graphql';
import { defaultsDeep } from 'lodash';

interface IField {
  id: string;
  name: string;
  title: string;
  description: string;
  type: string;
  group: string;
  fields?: IField[];
  position: number;
  contentTypeId: string;
  contentTypeFieldId: string;
  options: any;
  apiName: string;
}

interface IEntry {
  id?: string;
  entryId: string;
  versionId: string;
  contentTypeId: string;
  contentReleaseId?: string;
  language: string;
  isPublished: boolean;
  contentType: IContentType;
  data: object;
  createdAt: Date;
  updatedAt: Date;
  versions: any[];
}

interface IContentType {
  id: string;
  name: string;
  title: string;
  description: string;
  groups: string[];
  settings: object;
  isSlice: boolean;
  isTemplate: boolean;
  contentEntry: any;
  entriesCount?: number;
  fields: any[];
  schema: any[];
}

export interface IPrimeFieldProps {
  initialValue?: string;
  field: IField;
  form: FormComponentProps['form'];
  client: typeof ApolloClient;
  stores: {
    Auth: any;
    Settings: any;
    ContentEntries: any;
    ContentTypes: any;
    Users: any;
  };
  children?: any;
  entry?: IEntry;
  path: string;
  renderField(args: IPrimeFieldProps): React.ReactNode;
}

export interface IPrimeFieldGraphQLArguments {
  field: IField;
  queries: {
    [key: string]: any;
  };
  models: {
    ContentEntry: any;
  };
  contentType: IContentType;
  contentTypes: IContentType[];
  resolveFieldType: () => any;
  isUpdate: boolean;
}

type IPrimeFieldGraphQLOutput = null | GraphQLFieldConfig<any, any>;

type IPrimeFieldGraphQLInput = null | {
  type: GraphQLInputType | GraphQLInputObjectType;
};

export interface IRegisterField {
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
  public processInput(input: any, field: IField) {
    return input;
  }

  /**
   * Process output data
   * @param output Object for output
   */
  public processOutput(output: any, field: IField) {
    return output;
  }

  public getOptions(field: IField) {
    return defaultsDeep(field.options, this.defaultOptions);
  }
}

export function registerField(name: string, field: IRegisterField): IRegisterField {
  if (typeof window !== 'undefined') {
    const win: any = window;
    if (win.prime && win.prime.registerField) {
      win.prime.registerField(name, field);
    }
  }

  return field;
}
