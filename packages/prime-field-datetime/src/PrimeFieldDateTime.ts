import { PrimeField, PrimeFieldContext } from '@primecms/field';
import { GraphQLInputObjectType } from 'graphql';
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { isEmpty } from 'lodash';

interface Options {
  time: boolean;
}

const WhereDateTime = new GraphQLInputObjectType({
  name: 'Prime_Field_DateTime_WhereDateTime',
  fields: {
    neq: { type: GraphQLDateTime },
    eq: { type: GraphQLDateTime },
    gt: { type: GraphQLDateTime },
    lt: { type: GraphQLDateTime },
    gte: { type: GraphQLDateTime },
    lte: { type: GraphQLDateTime },
  },
});

const WhereDate = new GraphQLInputObjectType({
  name: 'Prime_Field_DateTime_WhereDate',
  fields: {
    neq: { type: GraphQLDate },
    eq: { type: GraphQLDate },
    gt: { type: GraphQLDate },
    lt: { type: GraphQLDate },
    gte: { type: GraphQLDate },
    lte: { type: GraphQLDate },
  },
});

export class PrimeFieldDateTime extends PrimeField {
  public static type: string = 'datetime';
  public static title: string = 'DateTime';
  public static description: string = 'Date and time field';
  public static options: Options = {
    time: true,
  };

  public outputType(context: PrimeFieldContext) {
    const { time } = this.options;

    return {
      type: time ? GraphQLDateTime : GraphQLDate,
      resolve(root, args, ctx, info) {
        if (!isEmpty(root[info.fieldName])) {
          const res = new Date(root[info.fieldName]);
          if (res.toString() !== 'Invalid Date') {
            return res;
          }
        }

        return null;
      },
    };
  }

  public inputType(context: PrimeFieldContext) {
    return {
      type: this.options.time ? GraphQLDateTime : GraphQLDate,
    };
  }

  public whereType(context: PrimeFieldContext) {
    return this.options.time ? WhereDateTime : WhereDate;
  }
}
