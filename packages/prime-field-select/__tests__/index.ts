import PrimeFieldSelect from '../src';

describe('PrimeFieldSelect', () => {
  let test: PrimeFieldSelect;
  const schema = { name: 'Example' };
  const items = [{ key: 'foo', value: 'Foo' }, { key: 'bar', value: 'Bar' }];
  const field = {
    name: 'arigato',
    options: { items },
  };
  const context = {
    schema,
    uniqueTypeName(value) {
      return value;
    },
  } as any;

  it('should have default export', () => {
    expect(typeof PrimeFieldSelect).toBe('function');
  });

  it('should have null type when empty', async () => {
    test = new PrimeFieldSelect({ ...field, options: { items: [] } } as any, {} as any);
    expect(await test.outputType(context)).toBeNull();
    expect(await test.inputType(context)).toBeNull();
    expect(await test.whereType(context)).toBeNull();
  });

  it('should return same input for processInput', async () => {
    test = new PrimeFieldSelect(field as any, {} as any);
    expect(await test.processInput(1)).toBe(1);
  });

  it('should have where type', async () => {
    expect((await test.whereType(context))!.toString()).toEqual('Example_Arigato_Where');
  });

  it('should resolve & expect iterable value', async () => {
    const { resolve } = await test.outputType(context)!;
    expect(resolve({ a: 'foo' }, {}, {}, { fieldName: 'a' })).toEqual(['Foo']);
    expect(resolve({}, {}, {}, { fieldName: 'a' })).toBeFalsy();
  });

  it('should have input type', async () => {
    const res = await test.inputType(context);
    expect(res).toBeTruthy();
  });
});
