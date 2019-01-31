import { GraphQLInputObjectType, GraphQLList, GraphQLObjectType } from 'graphql';
import { startCase } from 'lodash';
import { PrimeField, PrimeFieldContext, PrimeFieldOperation } from './PrimeField';

export class PrimeFieldGroup extends PrimeField {
  public async outputType(context: PrimeFieldContext) {
    const { name, uniqueTypeName } = context;
    const fields = {};
    const children = context.fields.filter(f => f.parentFieldId === this.schemaField.id);

    for (const field of children) {
      if (field.primeField) {
        const fieldType = await field.primeField.outputType(context, PrimeFieldOperation.READ);
        if (fieldType) {
          fields[field.name] = fieldType;
        }
      }
    }

    const type = new GraphQLObjectType({
      name: uniqueTypeName(`${name}_${startCase(this.schemaField.name)}`),
      fields,
    });

    return {
      type: this.schemaField.options.repeated ? new GraphQLList(type) : type,
    };
  }

  public async whereType(context: PrimeFieldContext) {
    const name = context.uniqueTypeName(`${context.name}_Sort_${startCase(this.schemaField.name)}`);
    const fields = {};
    for (const field of context.fields) {
      if (field.parentFieldId === this.schemaField.id && field.primeField) {
        const WhereType = await field.primeField.whereType({
          ...context,
          name,
        });
        if (WhereType) {
          fields[field.name] = {
            type: WhereType,
          };
        }
      }
    }
    return new GraphQLInputObjectType({
      name,
      fields,
    });
  }
}
