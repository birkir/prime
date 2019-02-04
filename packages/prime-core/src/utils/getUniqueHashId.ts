import hashids from 'hashids';
import { Repository } from 'typeorm';

const hashid = new hashids(process.env.HASHID_SALT || 'SaltingTheHash', 10);

export const getUniqueHashId = async (repository: Repository<any>, fieldName: string = 'id') => {
  const id = hashid.encode(Date.now());
  const count = await repository.count({
    where: { [fieldName]: id },
  });
  return count === 0 ? id : getUniqueHashId(repository, fieldName);
};
