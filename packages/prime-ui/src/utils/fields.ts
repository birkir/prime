export const fields: any = {};

export const registerField = (id: string, field: any) => {
  if (!fields[id]) {
    fields[id] = field;
  }
};

(window as any).prime = {
  fields,
  registerField,
};

// if (process.env.NODE_ENV === 'development') {
//   registerField('string', require('@primecms/field-string/src/ui').default);
//   registerField('group', require('@primecms/field-group/src/ui').default);
//   registerField('document', require('@primecms/field-document/src/ui').default);
// }
