import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { GraphQLFloat, GraphQLInputObjectType, GraphQLInt } from 'graphql';

interface IOptions {
  float: boolean;
}

export class PrimeFieldNumber extends PrimeField {

  public id: string = 'number';
  public title: string = 'Number';
  public description: string = 'Number field';

  public defaultOptions: IOptions = {
    float: true
  };

  public getGraphQLOutput(args: IPrimeFieldGraphQLArguments) {
    const { float } = this.getOptions(args.field);

    return {
      type: float ? GraphQLFloat : GraphQLInt
    };
  }

  public getGraphQLInput(args: IPrimeFieldGraphQLArguments) {
    const { float } = this.getOptions(args.field);

    return {
      type: float ? GraphQLFloat : GraphQLInt
    };
  }

  public getGraphQLWhere(args: IPrimeFieldGraphQLArguments) {
    const { float } = this.getOptions(args.field);
    const type = float ? GraphQLFloat : GraphQLInt;

    return {
      type: new GraphQLInputObjectType({
        name: `PrimeFieldNumberWhere${float ? 'Float' : ''}`,
        fields: {
          neq: { type },
          eq: { type },
          gt: { type },
          lt: { type },
          gte: { type },
          lte: { type }
        }
      })
    };
  }
}
