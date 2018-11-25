import * as express from 'express';
import { fields as allFields } from '../fields';

export const fields = express();

allFields.forEach((field: any) => {
  if (field.ui) {
    fields.use(`/${field.id}`, express.static(field.ui));
  }
});
