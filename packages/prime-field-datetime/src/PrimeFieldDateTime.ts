import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { isEmpty } from 'lodash'; // tslint:disable-line
import { primeFieldDateTimeWhere } from './primeFieldDateTimeWhere';

interface IPrimeFieldDateTimeOptions {
  time: boolean;
}

export class PrimeFieldDateTime extends PrimeField {
  public id: string = 'datetime';
  public title: string = 'DateTime';
  public description: string = 'Date and time field';

  public defaultOptions: IPrimeFieldDateTimeOptions = {
    time: true,
  };

  public getGraphQLOutput(args: IPrimeFieldGraphQLArguments) {
    const { time } = this.getOptions(args.field);

    return {
      type: time ? GraphQLDateTime : GraphQLDate,
      resolve(root, rArgs, context, info) {
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

  public getGraphQLInput(args: IPrimeFieldGraphQLArguments) {
    const { time } = this.getOptions(args.field);

    return {
      type: time ? GraphQLDateTime : GraphQLDate,
    };
  }

  public getGraphQLWhere({ field }: IPrimeFieldGraphQLArguments) {
    const { time } = this.getOptions(field);
    const type = time ? 'dateTime' : 'date';

    return {
      type: primeFieldDateTimeWhere[type],
    };
  }
}
