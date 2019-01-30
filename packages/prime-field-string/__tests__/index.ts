import { GraphQLNonNull } from 'graphql';
import PrimeFieldString from '../src';

describe('PrimeFieldString', () => {
  let test: PrimeFieldString;

  beforeAll(() => {
    test = new PrimeFieldString();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldString).toBe('function');
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
    expect(test.getGraphQLOutput({ field: {} })).not.toBeNull();
  });

  it('should have graphql input type', () => {
    expect(test.getGraphQLInput({ field: {} })).not.toBeNull();
    expect(
      test.getGraphQLInput({ field: { options: { rules: { required: true } } } }).type
    ).toBeInstanceOf(GraphQLNonNull);
  });

  it('should have graphql where type', () => {
    expect(test.getGraphQLWhere()).not.toBeNull();
  });

  it('should validate require rule', () => {
    const field = { options: { rules: { required: true } } };
    expect(() => test.processInput(undefined, field)).toThrow();
    expect(test.processInput('foo', field)).toBe('foo');
  });

  it('should validate urlsafe rule', () => {
    const field = { options: { rules: { urlsafe: true } } };
    expect(() => test.processInput('hæ', field)).toThrow();
  });

  it('should validate min rule', () => {
    const field = { options: { rules: { min: true, minValue: 4 } } };
    expect(() => test.processInput('foo', field)).toThrow();
    expect(test.processInput('foobar', field)).toBe('foobar');
  });

  it('should validate max rule', () => {
    const field = { options: { rules: { max: true, maxValue: 4 } } };
    expect(() => test.processInput('foobar', field)).toThrow();
    expect(test.processInput('foo', field)).toBe('foo');
  });
});
