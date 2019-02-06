import * as TypeORM from 'typeorm';

(TypeORM as any).getRepository = jest.fn(Model => ({
  async findOne() {
    const m = new Model();
    m.id = 123;
    m.variant = 0;
    m.groups = ['Main'];
    return m;
  },
  async find() {
    const field = new Model();
    field.id = 100;
    field.name = 'f1';
    field.schemaId = 123;
    const field2 = new Model();
    field2.id = 300;
    field2.name = 'f3';
    field2.group = 'Other';
    const field3 = new Model();
    field3.id = 200;
    field3.name = 'f2';
    field3.schemaId = 123;
    field3.parentFieldId = 100;
    field.fields = [field3];
    return [field, field2, field3];
  },
}));

import { getSchemaFields } from '../../../src/modules/internal/utils/getSchemaFields';

describe('getSchemaFields', () => {
  it('should match snapshot', async () => {
    expect(await getSchemaFields('123')).toMatchSnapshot();
  });
});
