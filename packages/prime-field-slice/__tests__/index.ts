import { PrimeFieldOperation, SchemaVariant } from '@primecms/field';
import { createMockSchema, createMockSchemaField } from '@primecms/field/lib/tests';
import { GraphQLString } from 'graphql';
import PrimeFieldSlice from '../src';

describe('PrimeFieldSlice', () => {
  let test: PrimeFieldSlice;

  const schema = createMockSchema({ name: 'SchemaForSlice' });

  const slice1 = createMockSchema({ id: 's1', name: 'Slice1', variant: SchemaVariant.Slice });
  const slice2 = createMockSchema({ id: 's2', name: 'Slice2', variant: SchemaVariant.Slice });

  const type1 = { name: 'Slice1', type: GraphQLString };
  const type2 = { name: 'Slice2', type: GraphQLString };
  const inputType1 = { args: { input: { type: GraphQLString } } };
  const inputType2 = { args: { input: { type: GraphQLString } } };

  const primeField = createMockSchemaField({ name: 'sample', type: PrimeFieldSlice.type, schema });
  const repos = {} as any;

  const createContext = () => {
    const types = new Map();
    types.set('Slice1', type1);
    types.set('Slice2', type2);
    types.set('createSlice1', inputType1);
    types.set('createSlice2', inputType2);
    return {
      name: schema.name,
      fields: [primeField],
      types,
      resolvers: {},
      schema,
      schemas: [schema, slice1, slice2],
      uniqueTypeName(name) {
        return name;
      },
    };
  };

  const createTestField = (options = {}) => {
    const field = { ...primeField, options };
    return new PrimeFieldSlice(field, repos);
  };

  beforeAll(() => {
    test = new PrimeFieldSlice({ options: {} } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldSlice).toBe('function');
  });

  it('should have null where type', async () => {
    expect(await test.whereType()).toBeNull();
  });

  it('should have null output type with no options', async () => {
    test = createTestField();
    expect(await test.outputType(createContext())).toBeNull();
  });

  it('should have null input type with no options', async () => {
    test = createTestField();
    expect(await test.inputType(createContext(), 0)).toBeNull();
  });

  it('should have output type', async () => {
    test = createTestField({
      schemaIds: ['s1', 's2'],
      multiple: false,
    });
    expect(await test.outputType(createContext())).toBeTruthy();
  });

  it('should have input type', async () => {
    test = createTestField({
      schemaIds: ['s1', 's2'],
      multiple: false,
    });
    expect(await test.inputType(createContext(), PrimeFieldOperation.CREATE)).toBeTruthy();
  });

  it('should have multiple output type', async () => {
    test = createTestField({
      schemaIds: ['s1', 's2'],
      multiple: true,
    });
    expect(await test.outputType(createContext())!.type.toString()).toEqual(
      '[SchemaForSlice_sample]'
    );
  });

  it('should have multiple input type', async () => {
    test = createTestField({
      schemaIds: ['s1', 's2'],
      multiple: true,
    });
    expect(
      await test.inputType(createContext(), PrimeFieldOperation.CREATE)!.type.toString()
    ).toEqual('[SchemaForSlice_sampleCreateInput!]');
  });
});
