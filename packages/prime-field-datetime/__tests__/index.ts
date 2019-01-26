import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import PrimeFieldDateTime from '../src';

describe('PrimeFieldDateTime', () => {
  let test: PrimeFieldDateTime;
  const field = { field: { options: { time: true } } } as any;
  const fieldNoTime = { field: { options: { time: false } } } as any;

  beforeAll(() => {
    test = new PrimeFieldDateTime();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldDateTime).toBe('function');
  });

  it('should have GraphQLDate input type', () => {
    const { type } = test.getGraphQLInput(fieldNoTime);
    expect(type).toBe(GraphQLDate);
  });

  it('should have GraphQLDate output type', () => {
    const { type } = test.getGraphQLOutput(fieldNoTime);
    expect(type).toBe(GraphQLDate);
  });

  it('should have GraphQLDate where type', () => {
    const { type } = test.getGraphQLWhere(fieldNoTime);
    expect(type.toString()).toBe('PrimeFieldDateTimeWhereDate');
  });

  it('should have GraphQLDateTime input type', () => {
    const { type } = test.getGraphQLInput(field);
    expect(type).toBe(GraphQLDateTime);
  });

  it('should have GraphQLDateTime output type', () => {
    const { type } = test.getGraphQLOutput(field);
    expect(type).toBe(GraphQLDateTime);
  });

  it('should have GraphQLDateTime where type', () => {
    const { type } = test.getGraphQLWhere(field);
    expect(type.toString()).toBe('PrimeFieldDateTimeWhereDateTime');
  });

  it('should always resolve Date or null', () => {
    const outputType = test.getGraphQLOutput(field);
    const fieldName = 'foo';
    const date = new Date();
    const root = { [fieldName]: date.toJSON() };
    const res = outputType.resolve(root, {}, {}, { fieldName });
    expect(outputType).not.toBeNull();
    expect(res!.toJSON()).toEqual(date.toJSON());
    expect(outputType.resolve(root, {}, {}, { fieldName: 'none' })).toBeNull();
    expect(outputType.resolve({ a: 'b' }, {}, {}, { fieldName: 'a' })).toBeNull();
  });
});
