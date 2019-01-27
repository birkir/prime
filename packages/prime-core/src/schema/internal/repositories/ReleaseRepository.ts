import { EntityRepository } from 'typeorm';
import { Release } from '../../../entities/Release';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(Release)
export class ReleaseRepository extends DataLoaderRepository<Release> {}
