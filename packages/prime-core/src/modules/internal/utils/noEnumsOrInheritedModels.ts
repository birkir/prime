import { isNumber } from 'lodash';

export const noEnumsOrInheritedModels = (item: any, key: string) => {
  if (key === 'User') {
    return true;
  }
  if (typeof item === 'object' && Object.values(item).every(isNumber)) {
    return true;
  }
  return false;
};
