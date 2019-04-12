import { EntityRepository } from 'typeorm';
import { User } from '../../../entities/User';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(User)
export class UserRepository extends DataLoaderRepository<User> {}
