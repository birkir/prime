import { EntityRepository } from 'typeorm';
import { UserMeta } from '../../../entities/UserMeta';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(UserMeta)
export class UserMetaRepository extends DataLoaderRepository<UserMeta> {}
