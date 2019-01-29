import { GraphQLList, GraphQLObjectType } from 'graphql';
import { PrimeField, PrimeFieldContext, PrimeFieldOperation } from './PrimeField';

export class PrimeFieldGroup extends PrimeField {
  public async outputType(context: PrimeFieldContext) {
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
      name: context.uniqueTypeName(context.schema.name + '_' + this.schemaField.name),
      fields,
    });

    return {
      type: this.schemaField.options.repeated ? new GraphQLList(type) : type,
    };
  }
}
