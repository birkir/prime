import { createMockSchema, createMockSchemaField } from '@primecms/field/lib/tests';
import { GraphQLString } from 'graphql';
import PrimeFieldDocument from '../src';

describe('PrimeFieldDocument', () => {
  let test: PrimeFieldDocument;

  const schema = createMockSchema({ id: 's1', name: 'Author' });
  const blogSchema = createMockSchema({ id: 's2', name: 'Blog' });

  const authorType = { name: 'Author', type: GraphQLString };
  const blogType = { name: 'Blog', type: GraphQLString };

  const primeField = createMockSchemaField({ name: 'blog', type: PrimeFieldDocument.type, schema });
  const repos = {} as any;

  const createContext = () => {
    const types = new Map();
    types.set('Author', authorType);
    types.set('Blog', blogType);

    return {
      name: schema.name,
      fields: [primeField],
      types,
      resolvers: {},
      schema,
      schemas: [schema, blogSchema],
      uniqueTypeName(name) {
        return name;
      },
    };
  };

  const createTestField = (options = {}) => {
    const field = { ...primeField, options };
    return new PrimeFieldDocument(field, repos);
  };

  beforeAll(() => {
    test = new PrimeFieldDocument({ options: {} } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldDocument).toBe('function');
  });

  it('should have null where type', async () => {
    expect(await test.whereType(createContext())).toBeNull();
  });

  it('should have null output type with no options', async () => {
    test = createTestField();
    expect(await test.outputType(createContext())).toBeNull();
  });

  it('should have input type with no options', async () => {
    test = createTestField();
    expect(await test.inputType()).toBeTruthy();
  });

  it('should have output type', async () => {
    test = createTestField({ schemaIds: ['s1', 's2'] });
    expect(await test.outputType(createContext())).toBeTruthy();
  });

  it('should have multiple output type', async () => {
    test = createTestField({ multiple: true, schemaIds: ['s1', 's2'] });
    expect(await test.outputType(createContext())).toBeTruthy();
  });
});
