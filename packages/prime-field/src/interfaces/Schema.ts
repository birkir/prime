import { Document } from './Document';
import { SchemaField } from './SchemaField';
import { SchemaVariant } from './SchemaVariant';

export interface Schema {
  id: string;
  name: string;
  title: string;
  variant: SchemaVariant;
  groups: any;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
  documents: Document[];
  fields: SchemaField[];
  user: any;
  setName(): Promise<void>;
}
