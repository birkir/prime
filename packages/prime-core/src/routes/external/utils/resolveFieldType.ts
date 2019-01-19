import { fields } from '../../../fields';

// tslint:disable-next-line no-any
export const resolveFieldType = (field, subfield = false): any => {
  if (subfield === false && field.contentTypeFieldId) {
    return null;
  }

  return fields.find((f: { id: string }) => f.id === field.type);
};
