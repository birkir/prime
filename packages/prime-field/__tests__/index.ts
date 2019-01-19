import { PrimeField, registerField } from '../src';

class PrimeFieldTest extends PrimeField {
  public id = 'a';
  public title = 'b';
  public description = 'c';

  public getGraphQLOutput() {
    return null;
  }
  public getGraphQLInput() {
    return null;
  }
  public getGraphQLWhere() {
    return null;
  }
}

describe('PrimeField', () => {
  it('should have PrimeField export', () => {
    expect(typeof PrimeField).toBe('function');
  });

  it('should return same input for processInput', () => {
    const test = new PrimeFieldTest();

    const input = 1;
    expect(test.processInput(input, {} as any)).toBe(input);
  });

  it('should return same output for processOutput', () => {
    const test = new PrimeFieldTest();

    const output = 2;
    expect(test.processOutput(output, {} as any)).toBe(output);
  });

  it('should return correct options', () => {
    const test = new PrimeFieldTest();

    const value = 1;
    const defaultValue = 10;

    test.defaultOptions = { defaultValue, value: -1 };

    const options = test.getOptions({ options: { value } } as any);
    expect(options.value).toBe(value);
    expect(options.defaultValue).toBe(defaultValue);
  });
});

describe('registerField', () => {
  const registerFieldFn = jest.fn();
  (global as any).window = { prime: { registerField: registerFieldFn } };

  it('should have registerField export', () => {
    expect(typeof registerField).toBe('function');
  });

  it('should be able to register field', () => {
    registerField('foo' as any, 'bar' as any);
  });
});
