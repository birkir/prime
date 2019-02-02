import { Query, Resolver } from 'type-graphql';
import { fields } from '../../../utils/fields';
import { PrimeField } from '../types/PrimeField';

@Resolver()
export class PrimeResolver {
  // public system() {} // was primeVersion
  // public getSettings() {}

  @Query(returns => [PrimeField])
  public allFields(): PrimeField[] {
    return fields;
  }

  // public updateSystem() {} // was primeUpdate
  // public updateAlgolia() {} // was syncAlgolia
}
