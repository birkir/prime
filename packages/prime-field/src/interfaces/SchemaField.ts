import { PrimeField } from '../PrimeField';
import { Schema } from './Schema';

export interface SchemaField {
  id: string;
  name: string;
  title: string;
  description: string;
  type: string;
  group: string;
  position: number;
  primary: boolean;
  options: any;
  defaultOptions?: any;
  fields: SchemaField[];
  parentFieldId?: string;
  parentField?: SchemaField | null;
  childFields?: SchemaField[];
  schemaId: string;
  schema: Schema;
  primeField?: PrimeField;
  setPrimeField(): void;
}
