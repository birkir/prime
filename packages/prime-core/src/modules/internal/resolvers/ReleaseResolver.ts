import { Context } from 'apollo-server-core';
import { Arg, Args, Ctx, FieldResolver, ID, Mutation, Query, Resolver, Root } from 'type-graphql';
import { getRepository } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Document } from '../../../entities/Document';
import { Release } from '../../../entities/Release';
import { ConnectionArgs, createConnectionType } from '../../../utils/createConnectionType';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { ReleaseRepository } from '../repositories/ReleaseRepository';
import { ReleaseInput } from '../types/ReleaseInput';
import { User } from '../types/User';

const ReleaseConnection = createConnectionType(Release);

@Resolver(of => Release)
export class ReleaseResolver {
  @InjectRepository(ReleaseRepository)
  private readonly releaseRepository: ReleaseRepository;

  @InjectRepository(DocumentRepository)
  private readonly documentRepository: DocumentRepository;

  @Query(returns => Release, { nullable: true, description: 'Get Release by ID' })
  public Release(
    @Arg('id', type => ID) id: string //
  ): Promise<Release> {
    return this.releaseRepository.loadOne(id);
  }

  @Query(returns => ReleaseConnection, { description: 'Get many Releases' })
  public allReleases(
    @Args() args: ConnectionArgs //
  ) {
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
    const release = await this.releaseRepository.findOneOrFail(id);

    await this.documentRepository.delete({
      releaseId: id,
    });

    await this.releaseRepository.remove(release);

    return true;
  }

  @Mutation(returns => Release, { description: 'Publish Release by ID' })
  public async publishRelease(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context
  ): Promise<Release> {
    const release = await this.Release(id);

    const ids = await this.documentRepository
      .createQueryBuilder()
      .select(
        qb =>
          qb
            .select('id')
            .from(Document, 'd')
            .where('d.documentId = Document.documentId')
            .andWhere('d.locale = Document.locale')
            .orderBy({ 'd.updatedAt': 'DESC' }),
        'id'
      )
      .addSelect('documentId')
      .where({
        releaseId: release.id,
      })
      .groupBy('documentId')
      .groupBy('locale')
      .getMany();

    const docs = await this.documentRepository.find({ where: { id: ids.map(d => d.id) } });
    await Promise.all(docs.map(doc => this.documentRepository.publish(doc, context.user.id)));

    this.documentRepository.update(
      { releaseId: release.id },
      {
        releaseId: undefined,
      }
    );

    release.publishedAt = new Date();
    release.publishedBy = context.user.id;
    await this.releaseRepository.save(release);

    return release;
  }

  @FieldResolver(returns => User, { description: 'Get Release User' })
  public user(@Root() release: Release): Promise<User> {
    return getRepository(User).findOneOrFail({
      cache: 1000,
      where: release.user,
    });
  }

  @FieldResolver(returns => [Document], { description: 'Get Release Documents' })
  public documents(@Root() release: Release): Promise<Document[]> {
    return this.documentRepository.find({
      releaseId: release.id,
    });
  }
}
