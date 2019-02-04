import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import PrimeFieldDateTime from '../src';

describe('PrimeFieldDateTime', () => {
  let testDate: PrimeFieldDateTime;
  let testDateTime: PrimeFieldDateTime;
  const payload = {} as any;

  beforeAll(() => {
    testDate = new PrimeFieldDateTime({ options: { time: false } } as any, {} as any);
    testDateTime = new PrimeFieldDateTime({ options: { time: true } } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldDateTime).toBe('function');
  });

  it('should have GraphQLDate input type', async () => {
    const { type } = await testDate.inputType(payload);
    expect(type).toBe(GraphQLDate);
  });

  it('should have GraphQLDate output type', async () => {
    const { type } = await testDate.outputType(payload);
    expect(type).toBe(GraphQLDate);
  });

  it('should have GraphQLDate where type', async () => {
    const type = await testDate.whereType(payload);
    expect(type.toString()).toBe('Prime_Field_DateTime_WhereDate');
  });

  it('should have GraphQLDateTime input type', async () => {
    const { type } = await testDateTime.inputType(payload);
    expect(type).toBe(GraphQLDateTime);
  });

  it('should have GraphQLDateTime output type', async () => {
    const { type } = await testDateTime.outputType(payload);
    expect(type).toBe(GraphQLDateTime);
  });

  it('should have GraphQLDateTime where type', async () => {
    const type = await testDateTime.whereType(payload);
    expect(type.toString()).toBe('Prime_Field_DateTime_WhereDateTime');
  });

  it('should always resolve Date or null', async () => {
    const outputType = await testDateTime.outputType(payload);
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
