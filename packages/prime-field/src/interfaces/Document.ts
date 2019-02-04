import { Schema } from './Schema';

export interface Document {
  id: string;
  documentId: string;
  locale: string;
  data: any;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  schemaId: string;
  schema: Schema;
  releaseId?: string;
  release: any;
  userId?: string;
  user: any;
}
