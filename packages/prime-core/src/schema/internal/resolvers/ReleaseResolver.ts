import { Context } from 'apollo-server-core';
import { GraphQLResolveInfo } from 'graphql';
import { Arg, Ctx, ID, Info, Query, Resolver } from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Release } from '../../../entities/Release';
import { ReleaseRepository } from '../repositories/ReleaseRepository';

@Resolver(of => Release)
export class ReleaseResolver {
  @InjectRepository(ReleaseRepository)
  private readonly releaseRepository: ReleaseRepository;

  @Query(returns => Release, { nullable: true, description: 'Get Release by ID' })
  public Release(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context,
    @Info() info: GraphQLResolveInfo
  ) {
    return this.releaseRepository.loadOne(id);
  }
}
