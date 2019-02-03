import { User } from '@accounts/typeorm';
import { EntityRepository } from 'typeorm';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(User)
export class UserRepository extends DataLoaderRepository<User> {}
