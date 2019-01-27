import { EntityRepository } from 'typeorm';
import { Release } from '../../../entities/Release';
import { DataLoaderRepository } from '../../../utils/DataLoaderRepository';

@EntityRepository(Release)
export class ReleaseRepository extends DataLoaderRepository<Release> {}
