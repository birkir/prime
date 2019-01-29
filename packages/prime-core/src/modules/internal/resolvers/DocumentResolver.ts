import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  ID,
  Mutation,
  Query,
  registerEnumType,
  Resolver,
  Root,
} from 'type-graphql';
import { Brackets, IsNull, Not } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Document } from '../../../entities/Document';
import { Context } from '../../../types/Context';
import { GraphQLJSON } from '../../../types/GraphQLJSON';
import { ConnectionArgs, createConnectionType } from '../../../utils/createConnectionType';
import { DocumentTransformer } from '../../../utils/DocumentTransformer';
import { getUniqueHashId } from '../../../utils/getUniqueHashId';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { DocumentFilterInput } from '../types/DocumentFilterInput';
import { DocumentInput } from '../types/DocumentInput';
import { DocumentVersion } from '../types/DocumentVersion';
import { ExtendedConnection } from '../utils/ExtendedConnection';

const DocumentConnection = createConnectionType(Document);

enum DocumentOrder {
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

registerEnumType(DocumentOrder, { name: 'DocumentConnectionOrder' });

@Resolver(of => Document)
export class DocumentResolver {
  @InjectRepository(DocumentRepository)
  private readonly documentRepository: DocumentRepository;
  private readonly documentTransformer: DocumentTransformer = new DocumentTransformer();

  @Query(returns => Document, { nullable: true })
  public Document(
    @Arg('id', type => ID, { description: 'Can be either id(uuid) or documentId(hashid)' })
    id: string,
    @Arg('locale', { nullable: true }) locale?: string,
    @Arg('releaseId', type => ID, { nullable: true }) releaseId?: string
  ) {
    const key = id.length === 36 ? 'id' : 'documentId';
    return this.documentRepository.loadOneByDocumentId(id, key, {
      releaseId,
      locale,
    });
  }

  @Query(returns => DocumentConnection)
  public allDocuments(
    @Arg('order', type => [DocumentOrder], { defaultValue: 1, nullable: true }) orders: string[],
    @Arg('filter', type => [DocumentFilterInput], { nullable: true })
    filters: DocumentFilterInput[],
    @Args() args: ConnectionArgs
  ) {
    return new ExtendedConnection(args, {
      where: qb => {
        const subquery = qb
          .subQuery()
          .select('id')
          .from(Document, 'd')
          .where('d.documentId = Document.documentId');

        const filterWithName = name =>
          new Brackets(builder => {
            filters.map((filter, i) => {
              builder.orWhere(
                new Brackets(sq => {
                  Object.entries(filter).map(([key, value]) =>
                    sq.andWhere(`${name}.${key} = :${key}_${i}`, { [`${key}_${i}`]: value })
                  );
                })
              );
            });
          });

        if (filters.length > 0) {
          subquery.andWhere(filterWithName('d'));
          qb.andWhere(filterWithName('Document'));
        }

        subquery.orderBy({ 'd.createdAt': 'DESC' }).limit(1);

        qb.having(`Document.id = ${subquery.getQuery()}`);
        qb.groupBy('Document.id');
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
      data: await this.documentTransformer.transformInput(input as Document),
      userId: context.user.id,
      documentId:
        input.documentId || (await getUniqueHashId(this.documentRepository, 'documentId')),
    });
    const doc = document.identifiers.pop() || { id: null };
    return this.documentRepository.findOneOrFail(doc.id);
  }

  @Mutation(returns => Document)
  public async updateDocument(
    @Arg('id', type => ID) id: string,
    @Arg('input', type => DocumentInput) input: DocumentInput,
    @Ctx() context: Context //
  ): Promise<Document> {
    const doc = await this.documentRepository.findOneOrFail(id);

    if (
      doc.publishedAt ||
      input.locale !== doc.locale ||
      input.releaseId !== doc.releaseId ||
      context.user.id !== doc.userId
    ) {
      delete doc.id;
      delete doc.publishedAt;
    }

    await this.documentRepository.merge(doc, {
      ...input,
      userId: context.user.id,
      data: await this.documentTransformer.transformInput(input as Document),
    });

    return doc;
  }

  @Mutation(returns => Boolean)
  public async removeDocument(
    @Arg('id', type => ID) id: string,
    @Arg('locale', { nullable: true }) locale?: string,
    @Arg('releaseId', type => ID, { nullable: true }) releaseId?: string
  ): Promise<boolean> {
    const doc = this.Document(id, locale, releaseId);
    await this.documentRepository.remove(doc);
    // @todo run webhook
    // @todo update algolia
    return true;
  }

  @Mutation(returns => Document)
  public async publishDocument(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context //
  ) {
    const doc = await this.documentRepository.findOneOrFail(id);
    await this.documentRepository.publish(doc, context.user.id);
    // @todo run webhook
    // @todo update algolia
    return doc;
  }

  @Mutation(returns => Document)
  public async unpublishDocument(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context //
  ) {
    const doc = await this.documentRepository.findOneOrFail(id);
    this.documentRepository.update(
      {
        documentId: doc.documentId,
        locale: doc.locale,
      },
      {
        publishedAt: null as any,
      }
    );
    // @todo run webhook
    // @todo update algolia
    return this.Document(id);
  }

  @FieldResolver(returns => GraphQLJSON, { nullable: true })
  public async data(@Root() document: Document): Promise<any> {
    return this.documentTransformer.transformOutput(document);
  }

  @FieldResolver(returns => [DocumentVersion], { nullable: true })
  public async versions(@Root() document: Document): Promise<Document[]> {
    return this.documentRepository.find({
      where: { documentId: document.documentId },
    });
  }

  @FieldResolver(returns => Document, {
    nullable: true,
    description: 'Get published version of the document (if any)',
  })
  public async published(@Root() document: Document): Promise<Document> {
    return this.documentRepository.loadOneByDocumentId(document.id, 'id', {
      publishedAt: Not(IsNull()),
    });
  }
}
