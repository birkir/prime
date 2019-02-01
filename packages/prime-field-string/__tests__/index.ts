import { GraphQLNonNull } from 'graphql';
import PrimeFieldString from '../src';

describe('PrimeFieldString', () => {
  let test: PrimeFieldString;

  beforeAll(() => {
    test = new PrimeFieldString(null as any, null as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldString).toBe('function');
  });

  it('should return same input for processInput', () => {
    const input = { foo: 1 };
    expect(test.processInput(input)).toBe(input);
  });

  it('should return same output for processOutput', () => {
    const output = { foo: 2 };
    expect(test.processOutput(output)).toBe(output);
  });

  it('should have graphql output type', () => {
    expect(test.outputType(null as any)).not.toBeNull();
  });

  it('should have graphql input type', async () => {
    expect(test.inputType(null as any, null as any)).not.toBeNull();
    expect((await test.inputType(null as any, null as any)).type).toBeInstanceOf(GraphQLNonNull);
  });

  it('should have graphql where type', async () => {
    expect(await test.whereType()).not.toBeNull();
  });

  // it('should validate require rule', () => {
  //   const field = { options: { rules: { required: true } } };
  //   expect(() => test.processInput(undefined, field)).toThrow();
  //   expect(test.processInput('foo', field)).toBe('foo');
  // });

  // it('should validate urlsafe rule', () => {
  //   const field = { options: { rules: { urlsafe: true } } };
  //   expect(() => test.processInput('hæ', field)).toThrow();
  // });

  // it('should validate min rule', () => {
  //   const field = { options: { rules: { min: true, minValue: 4 } } };
  //   expect(() => test.processInput('foo', field)).toThrow();
  //   expect(test.processInput('foobar', field)).toBe('foobar');
  // });

  // it('should validate max rule', () => {
  //   const field = { options: { rules: { max: true, maxValue: 4 } } };
  //   expect(() => test.processInput('foobar', field)).toThrow();
  //   expect(test.processInput('foo', field)).toBe('foo');
  // });
});
