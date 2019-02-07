import { EntityRepository } from 'typeorm';
import { SchemaField } from '../../../entities/SchemaField';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(SchemaField)
export class SchemaFieldRepository extends DataLoaderRepository<SchemaField> {}
