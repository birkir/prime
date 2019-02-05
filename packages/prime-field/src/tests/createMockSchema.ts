import { startCase } from 'lodash';
import { SchemaVariant } from '../interfaces/SchemaVariant';
import { generateRandomUuid } from './generateRandomUuid';

export const createMockSchema = ({
  name,
  variant = SchemaVariant.Default,
  groups = ['Main'],
  settings = {},
  ...passProps
}) => {
  const title = passProps.title || startCase(name);

  return {
    id: generateRandomUuid(),
    name,
    title,
    variant,
    groups,
    settings,
    createdAt: new Date(),
    updatedAt: new Date(),
    documents: [],
    fields: [],
    user: {},
    async setName() {
      // noop
    },
    ...passProps,
  };
};
