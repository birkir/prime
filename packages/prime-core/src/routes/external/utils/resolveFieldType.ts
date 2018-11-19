import { fields } from "../../../fields";

export const resolveFieldType = (field, subfield = false): any => {
  if (subfield === false && field.contentTypeFieldId) {
    return null;
  }

  return fields.find(f => f.id === field.type);
}
