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

if (process.env.NODE_ENV === 'development') {
  registerField('string', require('@primecms/field-string/ui/src').default);
  registerField('group', require('@primecms/field-group/ui/src').default);
  registerField('document', require('@primecms/field-document/ui/src').default);
  registerField('slice', require('@primecms/field-slice/ui/src').default);
}
