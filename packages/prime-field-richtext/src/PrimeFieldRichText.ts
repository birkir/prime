import { PrimeField, PrimeFieldContext, PrimeFieldOperation } from '@primecms/field';
import { ValidationError } from 'apollo-server-core';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromMarkdown } from 'draft-js-import-markdown';
import { GraphQLObjectType, GraphQLString } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

interface Options {
  md?: string[];
  rules: {
    required?: boolean;
  };
}

export class PrimeFieldRichText extends PrimeField {
  public static type = 'richtext';
  public static title = 'RichText';
  public static description = 'RichText field';
  public static defaultOptions: Options = {
    rules: {},
  };

  public async outputType(context: PrimeFieldContext) {
    return {
      type: new GraphQLObjectType({
        name: 'RichText',
        fields: {
          raw: {
            type: GraphQLJSON,
            resolve: (source: string) => stateFromMarkdown(source),
          },
          markdown: {
            type: GraphQLString,
            resolve: (source: string) => source,
          },
          html: {
            type: GraphQLString,
            resolve: (source: string) => stateToHTML(stateFromMarkdown(source)),
          },
        },
      }),
      description: this.schemaField.description,
    };
  }

  public async inputType(context: PrimeFieldContext, operation: PrimeFieldOperation) {
    return { type: GraphQLString };
  }

  public async processInput(value) {
    const { rules } = this.options;
    const { name } = this.schemaField;

    if (rules.required) {
      if (value === '' || value === undefined || value === null) {
        throw new ValidationError(`Field '${name}' is required`);
      }
    }

    return value;
  }

  public async whereType(context: PrimeFieldContext) {
    return null;
  }
}
