import { GraphQLInputObjectType } from 'graphql';
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';

export const primeFieldDateTimeWhere = {
  dateTime: new GraphQLInputObjectType({
    name: 'PrimeFieldDateTimeWhereDateTime',
    fields: {
      neq: { type: GraphQLDateTime },
      eq: { type: GraphQLDateTime },
      gt: { type: GraphQLDateTime },
      lt: { type: GraphQLDateTime },
      gte: { type: GraphQLDateTime },
      lte: { type: GraphQLDateTime }
    }
  }),
  date: new GraphQLInputObjectType({
    name: 'PrimeFieldDateTimeWhereDate',
    fields: {
      neq: { type: GraphQLDate },
      eq: { type: GraphQLDate },
      gt: { type: GraphQLDate },
      lt: { type: GraphQLDate },
      gte: { type: GraphQLDate },
      lte: { type: GraphQLDate }
    }
  })
};
