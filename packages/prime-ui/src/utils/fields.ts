/* tslint:disable no-console no-var-requires */
export const fields: any = {};

export const registerField = (id: string, field: any) => {
  if (!fields[id]) {
    fields[id] = field;
  }
};

(window as any).prime = (window as any).prime || {};
(window as any).prime.fields = fields;
(window as any).prime.registerField = registerField;

// Only used for core modules and packages (hot reloading)
// You can add your package in development here, but it won't be
// accepted into prime unless the module will be part of the cms core.
if (process.env.NODE_ENV === 'development') {
  registerField('asset', require('@primecms/field-asset/src/ui').default);
  registerField('boolean', require('@primecms/field-boolean/src/ui').default);
  registerField('datetime', require('@primecms/field-datetime/src/ui').default);
  registerField('document', require('@primecms/field-document/src/ui').default);
  registerField('group', require('@primecms/field-group/src/ui').default);
  registerField('number', require('@primecms/field-number/src/ui').default);
  registerField('select', require('@primecms/field-select/src/ui').default);
  registerField('slice', require('@primecms/field-slice/src/ui').default);
  registerField('string', require('@primecms/field-string/src/ui').default);

  console.log('using development fields');
}
