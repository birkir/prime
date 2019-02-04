import { GraphQLBoolean } from 'graphql';
import PrimeFieldBoolean from '../src';

describe('PrimeFieldBoolean', () => {
  let test: PrimeFieldBoolean;

  beforeAll(() => {
    test = new PrimeFieldBoolean({ options: {} } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldBoolean).toBe('function');
  });

  it('should return same input for processInput', async () => {
    expect(await test.processInput(true)).toBe(true);
    expect(await test.processInput(false)).toBe(false);
  });

  it('should return same output for processOutput', async () => {
    expect(await test.processOutput(true)).toBe(true);
    expect(await test.processOutput(false)).toBe(false);
  });

  it('should have graphql output type', async () => {
    expect(await test.outputType()).not.toBeNull();
  });

  it('should have graphql input type', async () => {
    expect(await test.inputType()).not.toBeNull();
  });

  it('should have graphql where type', async () => {
    expect(await test.whereType()).toBe(GraphQLBoolean);
  });
});
