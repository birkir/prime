import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
import { primeFieldDateTimeWhere } from './primeFieldDateTimeWhere';

interface IPrimeFieldDateTimeOptions {
  date: boolean;
  time: boolean;
}

export class PrimeFieldDateTime extends PrimeField {

  public id: string = 'datetime';
  public title: string = 'DateTime';
  public description: string = 'Date and time field';

  public defaultOptions: IPrimeFieldDateTimeOptions = {
    date: true,
    time: true
  };

  public getGraphQLOutput(args: IPrimeFieldGraphQLArguments) {
    const { date, time } = this.getOptions(args.field);

    return {
      type: date && time ? GraphQLDateTime : (time ? GraphQLTime : GraphQLDate),
      resolve(root, rArgs, context, info) {
        try {
          return new Date(root[info.fieldName]);
        } catch (e) {
          return null;
        }
      }
    };
  }

  public getGraphQLInput(args: IPrimeFieldGraphQLArguments) {
    const { date, time } = this.getOptions(args.field);

    return {
      type: date && time ? GraphQLDateTime : (time ? GraphQLTime : GraphQLDate)
    };
  }

  public getGraphQLWhere({ field }: IPrimeFieldGraphQLArguments) {
    const { date, time } = this.getOptions(field);
    const type = date && time ? 'dateTime' : (time ? 'time' : 'date');

    return {
      type: primeFieldDateTimeWhere[type]
    };
  }
}
