import { GraphQLList, GraphQLUnionType } from 'graphql';
import PrimeFieldSlice from '../src';

describe('PrimeFieldSlice', () => {
  let test: PrimeFieldSlice;
  const name = 'arigato';
  const apiName = 'Arigato';
  const contentType = { id: 'hello', name: 'Hello' };
  const contentTypes = [contentType];

  beforeAll(() => {
    test = new PrimeFieldSlice();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldSlice).toBe('function');
  });

  it('should have graphql output type', () => {
    const field = {
      contentType,
      contentTypes,
      queries: {
        __slices: {
          Hello: { outputType: 'ab3de2dba3' },
        },
      },
      field: {
        name,
        apiName,
        options: {
          multiple: false,
          contentTypeIds: [contentType.id],
        },
      },
    } as any;
    const unionType = test.getGraphQLOutput(field)!.type as any;
    expect(unionType).toBeInstanceOf(GraphQLUnionType);
    expect(unionType.resolveType({ __inputname: 'hello' }, {}, {})).toBeTruthy();
    expect(unionType.resolveType({}, {}, {})!.toString()).toEqual('UnknownSlice');

    const fieldWithMultiple = {
      ...field,
      field: {
        ...field.field,
        options: { ...field.field.options, multiple: true },
      },
    };
    expect(test.getGraphQLOutput(fieldWithMultiple)!.type!).toBeInstanceOf(GraphQLList);

    const fieldWithoutQueries = {
      ...field,
      queries: {
        __slices: {},
      },
    };
    expect(test.getGraphQLOutput(fieldWithoutQueries)).toBeNull();
    expect(test.getGraphQLOutput({ ...field, contentType: null })).toBeNull();
  });

  it('should have graphql input type', () => {
    const field = {
      isUpdate: true,
      contentType,
      contentTypes,
      queries: {
        __slices: {
          Hello: { outputType: 'ab3de2dba3' },
        },
      },
      field: {
        name,
        apiName,
        options: {
          multiple: false,
          contentTypeIds: [contentType.id],
        },
      },
    } as any;
    const updateType = test.getGraphQLInput(field)!.type as any;
    expect(updateType.toString()).toEqual('Hello_ArigatoUpdateInput');

    const createType = test.getGraphQLInput({ ...field, isUpdate: false })!.type as any;
    expect(createType.toString()).toEqual('Hello_ArigatoCreateInput');

    const fieldWithMultiple = {
      ...field,
      field: {
        ...field.field,
        options: { ...field.field.options, multiple: true },
      },
    };
    expect(test.getGraphQLInput(fieldWithMultiple)!.type!).toBeInstanceOf(GraphQLList);

    const fieldWithoutQueries = {
      ...field,
      contentTypes: [],
    };
    expect(test.getGraphQLInput(fieldWithoutQueries)).toBeNull();
    expect(test.getGraphQLInput({ ...field, contentType: null })).toBeNull();
  });

  it('should have null where type', () => {
    expect(test.getGraphQLWhere()).toBeNull();
  });
});
