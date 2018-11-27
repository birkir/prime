import * as express from 'express';
import { fields as allFields } from '../fields';

interface IField {
  id: string;
  name: string;
  description: string;
  ui: string;
  mode: 'production' | 'development';
  dir: string;
}

export const fields = express();

allFields.forEach((field: IField) => {
  if (field.ui) {
    fields.use(`/${field.id}`, express.static(field.ui));
  }
});
