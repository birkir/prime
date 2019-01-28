import { Arg, Args, Ctx, ID, Mutation, Query, registerEnumType, Resolver } from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Document } from '../../../entities/Document';
import { Context } from '../../../types/Context';
import { ConnectionArgs, createConnectionType } from '../../../utils/createConnectionType';
import { getUniqueHashId } from '../../../utils/getUniqueHashId';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { DocumentInput } from '../types/DocumentInput';
import { ExtendedConnection } from '../utils/ExtendedConnection';

const DocumentConnection = createConnectionType(Document);

enum DocumentConnectionOrder {
  updatedAt_ASC,
  updatedAt_DESC,
  createdAt_ASC,
  createdAt_DESC,
  userId_ASC,
  userId_DESC,
  documentId_ASC,
  documentId_DESC,
  schemaId_ASC,
  schemaId_DESC,
}

const sortOptions = orders =>
  orders.map(orderBy => {
    const [sort, order]: any = orderBy.split('_');
    return { sort, order };
  });

registerEnumType(DocumentConnectionOrder, { name: 'DocumentConnectionOrder' });

@Resolver(of => Document)
export class DocumentResolver {
  @InjectRepository(DocumentRepository)
  private readonly documentRepository: DocumentRepository;

  @Query(returns => Document, { nullable: true })
  public Document(
    @Arg('id', type => ID, { description: 'Can be either id(uuid) or documentId(hashid)' })
    id: string,
    @Arg('locale', { nullable: true }) locale: string,
    @Arg('releaseId', type => ID, { nullable: true }) releaseId: string
  ) {
    if (id.length === 36) {
      return this.documentRepository.loadOne(id);
    } else {
      return this.documentRepository.loadOneByDocumentId(id, {
        releaseId,
        locale,
      });
    }
  }

  @Query(returns => DocumentConnection)
  public allDocuments(
    @Args() args: ConnectionArgs,
    @Arg('order', type => [DocumentConnectionOrder], { defaultValue: 1, nullable: true })
    orders: string[],
    @Arg('releaseId', { nullable: true }) releaseId: string,
    @Arg('schemaId', { nullable: true }) schemaId: string,
    @Arg('userId', { nullable: true }) userId: string,
    @Arg('locale', { nullable: true }) locale: string
  ) {
    return new ExtendedConnection(args, {
      where: qb => {
        const subquery = qb
          .subQuery()
          .select('id')
          .from(Document, 'd');

        if (releaseId) {
          subquery.andWhere('releaseId = :releaseId', { releaseId });
        }
        if (schemaId) {
          subquery.andWhere('schemaId = :schemaId', { schemaId });
        }
        if (schemaId) {
          subquery.andWhere('locale = :locale', { locale });
        }

        subquery
          .andWhere('d.documentId = Document.documentId')
          .orderBy({ '"createdAt"': 'DESC' })
          .limit(1);

        qb.having(`Document.id = ${subquery.getQuery()}`);
        qb.groupBy('Document.id');

        if (userId) {
          subquery.andWhere('userId = :userId', { userId });
        }

        return qb;
      },
      repository: this.documentRepository,
      sortOptions: sortOptions(orders),
    });
  }

  @Mutation(returns => Document)
  public async createDocument(
    @Arg('input', type => DocumentInput) input: DocumentInput,
    @Ctx() context: Context
  ): Promise<Document> {
    const document = await this.documentRepository.insert({
      ...input,
      documentId:
        input.documentId || (await getUniqueHashId(this.documentRepository, 'documentId')),
      userId: context.user.id,
    });
    const doc = document.identifiers.pop() || { id: null };
    return this.documentRepository.findOneOrFail(doc.id);
  }

  @Mutation(returns => Document)
  public async updateDocument(
    @Arg('id', type => ID) id: string,
    @Arg('input', type => DocumentInput) input: DocumentInput
  ): Promise<Document> {
    const entity = await this.documentRepository.findOneOrFail(id);
    return this.documentRepository.merge(entity, input as any);
  }

  @Mutation(returns => Boolean)
  public async removeDocument(
    @Arg('id', type => ID) id: string //
  ): Promise<boolean> {
    const entity = await this.documentRepository.findOneOrFail(id);
    return Boolean(this.documentRepository.remove(entity));
  }

  // @todo missing implementation
  @Mutation(returns => Boolean)
  public async publishDocument(
    @Arg('id', type => ID) id: string //
  ) {
    return false;
  }

  // @todo missing implementation
  @Mutation(returns => Boolean)
  public async unpublishDocument(
    @Arg('id', type => ID) id: string //
  ) {
    return false;
  }
}
