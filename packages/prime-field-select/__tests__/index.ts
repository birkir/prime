import { GraphQLEnumType, GraphQLList, GraphQLNonNull } from 'graphql';
import PrimeFieldSelect from '../src';

describe('PrimeFieldSelect', () => {
  let test: PrimeFieldSelect;
  const contentType = { name: 'Example' };
  const items = [{ key: 'foo', value: 'Foo' }, { key: 'bar', value: 'Bar' }];

  beforeAll(() => {
    test = new PrimeFieldSelect();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldSelect).toBe('function');
  });

  it('should return same input for processInput', () => {
    expect(test.processInput(1, {} as any)).toBe(1);
  });

  it('should have where type', () => {
    const field = {
      contentType,
      field: { name: 'arigato', apiName: 'Arigato', options: { items } },
    } as any;
    expect(test.getGraphQLWhere(field)!.type.toString()).toEqual(
      'PrimeFieldSelectWhereExample_Arigato'
    );
  });

  it('should resolve', () => {
    const field = {
      contentType,
      field: { name: 'arigato', apiName: 'Arigato', options: { items } },
    } as any;
    const { resolve } = test.getGraphQLOutput(field)!;
    expect(resolve({ a: 'foo' }, {}, {}, { fieldName: 'a' })).toEqual('Foo');
    expect(resolve({}, {}, {}, { fieldName: 'a' })).toBeFalsy();
  });

  describe('no items', () => {
    it('should have null input type with enum', () => {
      const field = {
        contentType,
        field: { name: 'arigato', apiName: 'Arigato', options: { enum: true, items: [] } },
      } as any;
      expect(test.getGraphQLInput(field)).toBeNull();
      expect(test.getGraphQLOutput(field)).toBeNull();
      expect(test.getGraphQLWhere(field)).toBeNull();
    });
  });

  describe('enum', () => {
    const field = {
      contentType,
      field: { name: 'arigato', options: { enum: true, items } },
    } as any;
    it('should be of enum type', () => {
      expect(test.getGraphQLOutput(field)!.type).toBeInstanceOf(GraphQLEnumType);
    });
  });

  describe('required', () => {
    const field = {
      contentType,
      field: { name: 'arigato', options: { items, required: true } },
    } as any;
    it('should be of nonnull type', () => {
      expect(test.getGraphQLInput(field)!.type).toBeInstanceOf(GraphQLNonNull);
    });
  });

  describe('multiple', () => {
    const field = {
      contentType,
      field: { name: 'arigato', options: { multiple: true, items } },
    } as any;
    it('output should be of GraphQLList type', () => {
      const output = test.getGraphQLOutput(field);
      expect(output!.type!).toBeInstanceOf(GraphQLList);
    });
    it('input should be of GraphQLList type', () => {
      const input = test.getGraphQLInput(field);
      expect(input!.type!).toBeInstanceOf(GraphQLList);
    });
    it('where should be null', () => {
      const input = test.getGraphQLWhere(field);
      expect(input).toBeNull();
    });
  });
});
