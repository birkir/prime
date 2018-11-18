import { primeConfig } from '../../../utils/primeConfig';

// Resolve fields
const fields = (primeConfig.fields || []).map((moduleName: string) => {
  try {
    return new (require(moduleName).default)();
  } catch (err) {
    console.error(
      'ERROR: Could not resolve field module',
      '"' + moduleName + '"'
    );
    console.error(err);
  }
  return null;
})
.filter(n => !!n);

export const resolveFieldType = (field, subfield = false): any => {
  if (subfield === false && field.contentTypeFieldId) {
    return null;
  }

  return fields.find(f => f.id === field.type);
}
