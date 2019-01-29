import { Resolver } from 'type-graphql';

@Resolver()
export class PrimeResolver {
  public system() {} // was primeVersion
  public getSettings() {}
  public getFields() {}
  public updateSystem() {} // was primeUpdate
  // public updateAlgolia() {} // was syncAlgolia
}
