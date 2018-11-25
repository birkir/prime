import { client } from './client';
import { ALL_FIELDS } from '../stores/queries';

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

(async () => {
  const { data }: any = await client.query({ query: ALL_FIELDS });
  if (data.allFields) {
    data.allFields.forEach((field: any) => {
      if (field.ui) {
        const script = document.createElement('script');
        script.src = `http://localhost:4000/fields/${field.id}/index.js`;
        script.id = `Prime_Field_${field.id}`;
        document.body.appendChild(script);
      }
    });
  }
})();
