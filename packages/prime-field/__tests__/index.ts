import { PrimeField, registerField } from '../src';

class PrimeFieldTest extends PrimeField {
  public static type = 'a';
  public static title = 'b';
  public static description = 'c';
  public static options = {
    dummy: 1,
  };
}

describe('PrimeField', () => {
  it('should have PrimeField export', () => {
    expect(typeof PrimeField).toBe('function');
  });

  const test = new PrimeFieldTest({ options: { dummy: 2 } } as any, {} as any);

  it('should return correct options', () => {
    expect(test.options.dummy).toBe(2);
  });

  it('should return same input for processInput', async () => {
    const input = 1;
    expect(await test.processInput(input)).toBe(input);
  });

  it('should return same output for processOutput', async () => {
    const output = 2;
    expect(await test.processOutput(output)).toBe(output);
  });

  it('should have null inputType', async () => {
    expect(await test.inputType({} as any, 0)).toBe(null);
  });

  it('should have null outputType', async () => {
    expect(await test.outputType({} as any, 0)).toBe(null);
  });

  it('should have null whereType', async () => {
    expect(await test.whereType({} as any)).toBe(null);
  });
});

describe('registerField', () => {
  const registerFieldFn = jest.fn();
  (global as any).prime = { registerField: registerFieldFn };

  it('should have registerField export', () => {
    expect(typeof registerField).toBe('function');
  });

  it('should be able to register field', () => {
    registerField('foo' as any, 'bar' as any);
    expect(registerFieldFn).toBeCalled();
  });
});
