import { GraphQLNonNull } from 'graphql';
import PrimeFieldNumber from '../src';

describe('PrimeFieldNumber', () => {
  let test: PrimeFieldNumber;

  beforeAll(() => {
    test = new PrimeFieldNumber();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldNumber).toBe('function');
  });

  it('should return same input for processInput', () => {
    const input = 1;
    expect(test.processInput(input, {} as any)).toBe(input);
  });

  it('should return same output for processOutput', () => {
    const output = 2;
    expect(test.processOutput(output, {} as any)).toBe(output);
  });

  it('should have graphql output type', () => {
    expect(test.getGraphQLOutput({ field: {} } as any)).not.toBeNull();
  });

  it('should have graphql input type', () => {
    expect(test.getGraphQLInput({ field: {} } as any)).not.toBeNull();
    expect(
      test.getGraphQLInput({ field: { options: { rules: { required: true } } } } as any).type
    ).toBeInstanceOf(GraphQLNonNull);
  });

  it('should have graphql where type', () => {
    expect(test.getGraphQLWhere({ field: { options: {} } } as any)).not.toBeNull();
  });

  it('should validate require rule', () => {
    const field = { options: { rules: { required: true } } };
    expect(() => test.processInput(undefined, field)).toThrow();
    expect(test.processInput(100, field)).toBe(100);
  });

  it('should validate min rule', () => {
    const field = { options: { rules: { min: true, minValue: 10 } } };
    expect(() => test.processInput(5, field)).toThrow();
    expect(test.processInput(15, field)).toBe(15);
  });

  it('should validate max rule', () => {
    const field = { options: { rules: { max: true, maxValue: 10 } } };
    expect(() => test.processInput(15, field)).toThrow();
    expect(test.processInput(5, field)).toBe(5);
  });
});
