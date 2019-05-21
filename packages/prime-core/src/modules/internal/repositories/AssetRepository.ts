import { EntityRepository } from 'typeorm';
import { Asset } from '../../../entities/Asset';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(Asset)
export class AssetRepository extends DataLoaderRepository<Asset> {}
