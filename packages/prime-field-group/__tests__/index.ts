import { PrimeFieldOperation } from '@primecms/field';
import { createMockSchema, createMockSchemaField } from '@primecms/field/lib/tests';
import PrimeFieldGroup from '../src';

describe('PrimeFieldGroup', () => {
  let test: PrimeFieldGroup;

  const schema = createMockSchema({ name: 'SchemaForGroup' });
  const primeField = createMockSchemaField({ name: 'sample', type: PrimeFieldGroup.type, schema });
  const repos = {} as any;

  const createContext = (fields = []) => {
    return {
      name: schema.name,
      fields: [primeField, ...fields],
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
    return new PrimeFieldGroup(field, repos);
  };

  beforeAll(() => {
    test = createTestField();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldGroup).toBe('function');
  });

  it('should return same input for processInput', async () => {
    const input = 1;
    expect(await test.processInput(input)).toBe(input);
  });

  it('should have output type', async () => {
    test = createTestField();
    expect(await test.outputType(createContext(), PrimeFieldOperation.READ)).toBeTruthy();
  });

  it('should have input type', async () => {
    test = createTestField();
    expect(await test.inputType(createContext(), PrimeFieldOperation.CREATE)).toBeTruthy();
  });

  it('should have input type', async () => {
    test = createTestField();
    expect(await test.inputType(createContext(), PrimeFieldOperation.CREATE)).toBeTruthy();
  });

  it('should have where type', async () => {
    test = createTestField();
    expect(await test.whereType(createContext())).toBeTruthy();
  });
});
