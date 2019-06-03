import { PrimeFieldOperation } from '@primecms/field';
import { createMockSchema, createMockSchemaField } from '@primecms/field/lib/tests';
import { ValidationError } from 'apollo-server-core';
import { GraphQLString } from 'graphql';
import PrimeFieldRichText from '../src';

const expectValidationError = async (test, message) => {
  try {
    await test();
    throw new Error();
  } catch (e) {
    expect(e instanceof ValidationError).toBe(true);
    expect(e.message).toBe(message);
  }
};

describe('PrimeFieldRichText', () => {
  let test: PrimeFieldRichText;
  const schema = createMockSchema({ name: 'SchemaForRichText' });
  const primeField = createMockSchemaField({
    name: 'sample',
    type: PrimeFieldRichText.type,
    schema,
  });
  const repos = {} as any;

  const createContext = () => {
    return {
      name: schema.name,
      fields: [primeField],
      types: new Map(),
      resolvers: {},
      schema,
      schemas: [],
      uniqueTypeName(name) {
        return name;
      },
    };
  };

  const createTestField = (options = {}) => {
    const field = { ...primeField, options };
    return new PrimeFieldRichText(field, repos);
  };

  it('should have default export', () => {
    expect(typeof PrimeFieldRichText).toBe('function');
  });

  it('should return same input for processInput', async () => {
    test = new PrimeFieldRichText(primeField, repos);
    const input = 'my-richtext-input';
    expect(await test.processInput(input)).toBe(input);
  });

  it('should return same output for processOutput', async () => {
    const output = 'my-richtext-output';
    expect(await test.processOutput(output)).toBe(output);
  });

  it('should have graphql output type', async () => {
    expect(await test.outputType(createContext())).not.toBeNull();
  });

  it('should have graphql input type', async () => {
    test = createTestField();
    expect(await test.inputType(createContext(), PrimeFieldOperation.CREATE)).not.toBeNull();
    expect((await test.inputType(createContext(), PrimeFieldOperation.CREATE))!.type).toBe(
      GraphQLString
    );
  });

  it('should have graphql where type', async () => {
    expect(await test.whereType(createContext())).not.toBeNull();
  });

  it('should validate require rule', async () => {
    test = createTestField({ rules: { required: true } });
    await expectValidationError(() => test.processInput(undefined), `Field 'sample' is required`);
    expect(await test.processInput('foo')).toBe('foo');
  });
});
