import { client } from './client';

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
  registerField('asset', require('@primecms/field-asset/ui/src').default);
  registerField('datetime', require('@primecms/field-datetime/ui/src').default);
  registerField('document', require('@primecms/field-document/ui/src').default);
  registerField('group', require('@primecms/field-group/ui/src').default);
  registerField('slice', require('@primecms/field-slice/ui/src').default);
  registerField('string', require('@primecms/field-string/ui/src').default);
}
