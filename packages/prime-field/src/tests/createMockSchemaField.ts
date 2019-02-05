import { startCase } from 'lodash';
import { generateRandomUuid } from './generateRandomUuid';

export const createMockSchemaField = ({
  name,
  type,
  schema,
  description = '',
  group = 'Main',
  position = 0,
  primary = false,
  options = {},
  ...passProps
}) => {
  const title = passProps.title || startCase(name);
  return {
    id: generateRandomUuid(),
    name,
    title,
    description,
    type,
    group,
    position,
    primary,
    options,
    fields: [],
    parentField: null,
    childFields: [],
    schemaId: schema.id,
    schema,
    setPrimeField() {
      return null;
    },
    ...passProps,
  };
};
