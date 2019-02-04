import { EntityRepository } from 'typeorm';
import { Schema } from '../../../entities/Schema';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(Schema)
export class SchemaRepository extends DataLoaderRepository<Schema> {}
