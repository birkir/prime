import { Context } from 'apollo-server-core';
import { GraphQLResolveInfo } from 'graphql';
import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  ID,
  Info,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { getRepository } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Release } from '../../../entities/Release';
import { ConnectionArgs, createConnectionType } from '../../../utils/createConnectionType';
import { ReleaseRepository } from '../repositories/ReleaseRepository';
import { ReleaseInput } from '../types/ReleaseInput';
import { User } from '../types/User';

const ReleaseConnection = createConnectionType(Release);

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

  @Query(returns => ReleaseConnection, { description: 'Get many Releases' })
  public allReleases(@Args() args: ConnectionArgs) {
    return new EntityConnection(args, {
      repository: this.releaseRepository,
      sortOptions: [{ sort: 'createdAt', order: 'DESC' }],
    });
  }

  @Mutation(returns => Release, { description: 'Create Release' })
  public async createRelease(
    @Arg('input') input: ReleaseInput,
    @Ctx() context: Context
  ): Promise<Release> {
    const entity = this.releaseRepository.create(input);
    await this.releaseRepository.save(entity);
    return entity;
  }

  @Mutation(returns => Release, { description: 'Update Release by ID' })
  public async updateRelease(
    @Arg('id', type => ID) id: string,
    @Arg('input') input: ReleaseInput,
    @Ctx() context: Context
  ): Promise<Release> {
    const entity = await this.releaseRepository.findOneOrFail(id);
    return this.releaseRepository.merge(entity, input);
  }

  @Mutation(returns => Boolean, { description: 'Remove Release by ID' })
  public async removeRelease(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context
  ): Promise<boolean> {
    const entity = await this.releaseRepository.findOneOrFail(id);
    return Boolean(this.releaseRepository.remove(entity));
  }

  // @todo missing implementation
  @Mutation(returns => Boolean, { description: 'Publish Release by ID' })
  public async publishContentRelease() {
    return false;
  }

  @FieldResolver(returns => User, { description: 'Get Release User' })
  public user(@Root() release: Release): Promise<User> {
    return getRepository(User).findOneOrFail({
      cache: 1000,
      where: release.user,
    });
  }
}
