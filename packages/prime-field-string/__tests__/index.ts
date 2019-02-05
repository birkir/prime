import { createMockSchema, createMockSchemaField, PrimeFieldOperation } from '@primecms/field';
import { ValidationError } from 'apollo-server-core';
import { GraphQLString } from 'graphql';
import PrimeFieldString from '../src';

const expectValidationError = async (test, message) => {
  try {
    await test();
    throw new Error();
  } catch (e) {
    expect(e instanceof ValidationError).toBe(true);
    expect(e.message).toBe(message);
  }
};

describe('PrimeFieldString', () => {
  let test: PrimeFieldString;
  const schema = createMockSchema({ name: 'SchemaForString' });
  const primeField = createMockSchemaField({ name: 'sample', type: PrimeFieldString.type, schema });
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
    return new PrimeFieldString(field, repos);
  };

  it('should have default export', () => {
    expect(typeof PrimeFieldString).toBe('function');
  });

  it('should return same input for processInput', async () => {
    test = new PrimeFieldString(primeField, repos);
    const input = 'my-string-input';
    expect(await test.processInput(input)).toBe(input);
  });

  it('should return same output for processOutput', async () => {
    const output = 'my-string-output';
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

  it('should validate urlsafe rule', async () => {
    test = createTestField({ rules: { urlsafe: true } });
    await expectValidationError(
      () => test.processInput('hæ'),
      `Field 'sample' must be url-safe (/^[A-Za-z][A-Za-z0-9_-]*$/)`
    );
  });

  it('should validate min rule', async () => {
    test = createTestField({ rules: { min: true, minValue: 4 } });
    await expectValidationError(
      () => test.processInput('foo'),
      `Field 'sample' must be 4 characters or more`
    );
    test = createTestField({ rules: { min: true, minValue: 1 } });
    await expectValidationError(
      () => test.processInput(''),
      `Field 'sample' must be 1 character or more`
    );
    expect(await test.processInput('foobar')).toBe('foobar');
  });

  it('should validate max rule', async () => {
    test = createTestField({ rules: { max: true, maxValue: 4 } });
    await expectValidationError(
      () => test.processInput('foobar'),
      `Field 'sample' must be 4 characters or less`
    );
    expect(await test.processInput('foo')).toBe('foo');

    test = createTestField({ rules: { max: true, maxValue: 1 } });
    await expectValidationError(
      () => test.processInput('foo'),
      `Field 'sample' must be 1 character or less`
    );
  });
});
