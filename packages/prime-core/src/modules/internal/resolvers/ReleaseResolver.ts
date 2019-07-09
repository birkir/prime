import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Inject } from 'typedi';
import { getRepository, In } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Document } from '../../../entities/Document';
import { Release } from '../../../entities/Release';
import { User } from '../../../entities/User';
import { processWebhooks } from '../../../utils/processWebhooks';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { ReleaseRepository } from '../repositories/ReleaseRepository';
import { ConnectionArgs, createConnectionType } from '../types/createConnectionType';
import { ReleaseInput } from '../types/ReleaseInput';
import { Authorized } from '../utils/Authorized';
import { ExtendedConnection } from '../utils/ExtendedConnection';
import { DocumentResolver } from './DocumentResolver';
import { Context } from '../../../interfaces/Context';

const ReleaseConnection = createConnectionType(Release);

@Resolver(of => Release)
export class ReleaseResolver {
  @InjectRepository(ReleaseRepository)
  private readonly releaseRepository: ReleaseRepository;

  @InjectRepository(DocumentRepository)
  private readonly documentRepository: DocumentRepository;

  @Inject(x => DocumentResolver)
  private readonly documentResolver: DocumentResolver;

  @Authorized()
  @Query(returns => Release, { nullable: true, description: 'Get Release by ID' })
  public Release(
    @Arg('id', type => ID) id: string //
  ): Promise<Release> {
    return this.releaseRepository.loadOne(id);
  }

  @Authorized()
  @Query(returns => ReleaseConnection, { description: 'Get many Releases' })
  public allReleases(
    @Args() args: ConnectionArgs //
  ) {
    return new ExtendedConnection(args, {
      repository: this.releaseRepository,
      sortOptions: [{ sort: 'createdAt', order: 'DESC' }],
    });
  }

  @Mutation(returns => Release, { description: 'Create Release' })
  public async createRelease(
    @Arg('input') input: ReleaseInput,
    @Ctx() context: Context
  ): Promise<Release> {
    const release = this.releaseRepository.create(input);
    await this.releaseRepository.save(release);
    processWebhooks('release.created', { release });
    return release;
  }

  @Authorized()
  @Mutation(returns => Release, { description: 'Update Release by ID' })
  public async updateRelease(
    @Arg('id', type => ID) id: string,
    @Arg('input') input: ReleaseInput,
    @Ctx() context: Context
  ): Promise<Release> {
    const release = await this.releaseRepository.findOneOrFail(id);
    await this.releaseRepository.merge(release, input);
    processWebhooks('release.updated', { release });
    return await this.releaseRepository.save(release);
  }

  @Authorized()
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

    processWebhooks('release.removed', { release });

    return true;
  }

  @Authorized()
  @Mutation(returns => Release, { description: 'Publish Release by ID' })
  public async publishRelease(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context
  ): Promise<Release> {
    const release = await this.Release(id);

    const qb = this.documentRepository.createQueryBuilder();

    const subquery = qb
      .subQuery()
      .select('id')
      .from(Document, 'd')
      .where('d.documentId = Document.documentId')
      .andWhere('d.locale = Document.locale')
      .andWhere('d.deletedAt IS NULL')
      .orderBy({ 'd.updatedAt': 'DESC' })
      .limit(1);

    const ids = await qb
      .where({
        releaseId: release.id,
      })
      .having(`Document.id = ${subquery.getQuery()}`)
      .groupBy('Document.id')
      .addGroupBy('Document.locale')
      .getMany();

    if (ids.length > 0) {
      const docs = await this.documentRepository.find({ where: { id: In(ids.map(d => d.id)) } });
      await Promise.all(docs.map(doc => this.documentRepository.publish(doc, context.user.id)));
    }

    this.documentRepository.update(
      { releaseId: release.id },
      {
        releaseId: null as any,
      }
    );

    release.publishedAt = new Date();
    release.publishedBy = context.user.id;
    await this.releaseRepository.save(release);

    processWebhooks('release.published', { release });

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
  public async documents(
    @Root() release: Release //
  ): Promise<Document[]> {
    const where = { releaseId: release.id } as any;
    const result = await this.documentResolver.allDocuments([], [where], {});
    const edges = await result.edges;
    return edges.map(edge => {
      return edge.node;
    });
  }

  @FieldResolver(returns => Int, { description: 'Get Release Document Count' })
  public async documentsCount(@Root() release: Release): Promise<number> {
    const where = { releaseId: release.id } as any;
    const result = await this.documentResolver.allDocuments([], [where], {});
    return result.totalCount;
  }
}
