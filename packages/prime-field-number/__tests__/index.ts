import { GraphQLNonNull } from 'graphql';
import PrimeFieldNumber from '../src';

describe('PrimeFieldNumber', () => {
  let test: PrimeFieldNumber;
  const payload = {} as any;

  beforeAll(() => {
    test = new PrimeFieldNumber({ options: {} } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldNumber).toBe('function');
  });

  it('should return same input for processInput', async () => {
    const input = 1;
    expect(await test.processInput(input)).toBe(input);
  });

  it('should return same output for processOutput', async () => {
    const output = 2;
    expect(await test.processOutput(output)).toBe(output);
  });

  it('should have graphql output type', async () => {
    expect(await test.outputType(payload)).not.toBeNull();
  });

  it('should have graphql input type', async () => {
    test = new PrimeFieldNumber({ options: { rules: { required: true } } } as any, {} as any);

    expect(test.inputType(payload)).not.toBeNull();
    expect((await test.inputType(payload)).type).toBeInstanceOf(GraphQLNonNull);
  });

  it('should have graphql where type', async () => {
    expect(await test.whereType(payload)).not.toBeNull();
  });

  it('should validate require rule', async () => {
    test = new PrimeFieldNumber({ options: { rules: { required: true } } } as any, {} as any);
    expect(() => test.processInput(undefined)).toThrow();
    expect(await test.processInput(100)).toBe(100);
  });

  it('should validate min rule', async () => {
    test = new PrimeFieldNumber(
      { options: { rules: { min: true, minValue: 10 } } } as any,
      {} as any
    );
    expect(() => test.processInput(5)).toThrow();
    expect(await test.processInput(15)).toBe(15);
  });

  it('should validate max rule', async () => {
    test = new PrimeFieldNumber(
      { options: { rules: { max: true, maxValue: 10 } } } as any,
      {} as any
    );
    expect(() => test.processInput(15)).toThrow();
    expect(await test.processInput(5)).toBe(5);
  });
});
