import GraphQLJSON from 'graphql-type-json';
import { get, identity, pickBy } from 'lodash';
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
import { Brackets, In, IsNull, Raw } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Document } from '../../../entities/Document';
import { Context } from '../../../interfaces/Context';
import { DocumentTransformer } from '../../../utils/DocumentTransformer';
import { getUniqueHashId } from '../../../utils/getUniqueHashId';
import { processWebhooks } from '../../../utils/processWebhooks';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { SchemaFieldRepository } from '../repositories/SchemaFieldRepository';
import { SchemaRepository } from '../repositories/SchemaRepository';
import { ConnectionArgs, createConnectionType } from '../types/createConnectionType';
import { DocumentFilterInput } from '../types/DocumentFilterInput';
import { DocumentInput } from '../types/DocumentInput';
import { DocumentVersion } from '../types/DocumentVersion';
import { Authorized } from '../utils/Authorized';
import { ExtendedConnection } from '../utils/ExtendedConnection';

const DocumentConnection = createConnectionType(Document);

enum DocumentSort {
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

registerEnumType(DocumentSort, { name: 'DocumentConnectionSort' });

@Resolver(of => Document)
export class DocumentResolver {
  @InjectRepository(SchemaRepository)
  private readonly schemaRepository: SchemaRepository;

  @InjectRepository(SchemaFieldRepository)
  private readonly schemaFieldRepository: SchemaFieldRepository;

  @InjectRepository(DocumentRepository)
  private readonly documentRepository: DocumentRepository;

  private readonly documentTransformer: DocumentTransformer = new DocumentTransformer();

  @Authorized()
  @Query(returns => Document, { nullable: true })
  public Document(
    @Arg('id', type => ID, { description: 'Can be either uuid or documentId' }) id: string,
    @Arg('locale', { nullable: true }) locale?: string,
    @Arg('releaseId', type => ID, { nullable: true }) releaseId?: string
  ) {
    const key = id.length === 36 ? 'id' : 'documentId';
    return this.documentRepository.loadOneByDocumentId(id, key, {
      releaseId,
      locale,
    });
  }

  @Authorized()
  @Query(returns => DocumentConnection)
  public async allDocuments(
    @Arg('sort', type => [DocumentSort], { defaultValue: 1, nullable: true }) sorts: string[],
    @Arg('filter', type => [DocumentFilterInput], { nullable: true })
    filters: DocumentFilterInput[],
    @Args() args: ConnectionArgs
  ) {
    const result = new ExtendedConnection(args, {
      where: (qb, counter = false) => {
        qb.andWhere('Document.deletedAt IS NULL');

        const subquery = qb
          .subQuery()
          .select('id')
          .from(Document, 'd')
          .where('d.documentId = Document.documentId')
          .andWhere('d.deletedAt IS NULL');

        const filterWithName = (name, filterArr) =>
          new Brackets(builder => {
            filterArr.map((filter, i) => {
              builder.orWhere(
                new Brackets(sq => {
                  Object.entries(filter).map(([key, value]) => {
                    if (value === null) {
                      sq.andWhere(`${name}.${key} IS NULL`);
                    } else {
                      sq.andWhere(`${name}.${key} = :${key}_${i}`, { [`${key}_${i}`]: value });
                    }
                  });
                })
              );
            });
          });

        const filtered = (filters || []).map(filter =>
          pickBy(filter, (value, key) => {
            return key === 'releaseId' || identity(value);
          })
        );

        if (filtered.length > 0 && Object.keys(filtered[0]).length > 0) {
          subquery.andWhere(filterWithName('d', filtered));
          qb.andWhere(filterWithName('Document', filtered));
        }

        subquery.orderBy({ 'd.createdAt': 'DESC' }).limit(1);

        if (!counter) {
          qb.having(`Document.id = ${subquery.getQuery()}`);
          qb.groupBy('Document.id');
        }
        return qb;
      },
      repository: this.documentRepository,
      sortOptions: sortOptions(sorts),
    });
    result.totalCountField = 'documentId';

    return result;
  }

  @Authorized()
  @Mutation(returns => Document)
  public async createDocument(
    @Arg('input', type => DocumentInput) input: DocumentInput,
    @Ctx() context: Context
  ): Promise<Document> {
    const schema = await this.schemaRepository.findOneOrFail(input.schemaId, { cache: 1000 });
    const document = await this.documentRepository.insert({
      ...input,
      data: await this.documentTransformer.transformInput(input.data, schema),
      userId: context.user.id,
      documentId:
        input.documentId || (await getUniqueHashId(this.documentRepository, 'documentId')),
    });
    const doc = document.identifiers.pop() || { id: null };
    return this.documentRepository.findOneOrFail(doc.id);
  }

  @Authorized()
  @Mutation(returns => Document)
  public async updateDocument(
    @Arg('id', type => ID) id: string,
    @Arg('data', type => GraphQLJSON, { nullable: true }) data: GraphQLJSON,
    @Arg('locale', { nullable: true }) locale: string,
    @Arg('releaseId', type => ID, { nullable: true }) releaseId: string,
    @Ctx() context: Context //
  ): Promise<Document> {
    const doc = await this.documentRepository.findOneOrFail({ id, deletedAt: IsNull() });
    const schema = await this.schemaRepository.findOneOrFail(doc.schemaId, { cache: 1000 });

    delete doc.id;
    delete doc.publishedAt;
    delete doc.createdAt;
    delete doc.updatedAt;

    const document = await this.documentRepository.insert({
      ...doc,
      ...(data && { data: await this.documentTransformer.transformInput(data, schema) }),
      ...(releaseId && { releaseId }),
      userId: context.user.id,
      documentId: doc.documentId || (await getUniqueHashId(this.documentRepository, 'documentId')),
    });

    const res = document.identifiers.pop() || { id: null };
    return this.documentRepository.findOneOrFail(res.id);
  }

  @Authorized()
  @Mutation(returns => Boolean)
  public async removeDocument(
    @Arg('id', type => ID) id: string,
    @Arg('locale', { nullable: true }) locale?: string,
    @Arg('releaseId', type => ID, { nullable: true }) releaseId?: string
  ): Promise<boolean> {
    const document = await this.Document(id, locale, releaseId);
    await this.documentRepository.update(
      {
        documentId: document.documentId,
        ...(locale && { locale }),
        ...(releaseId && { releaseId }),
      },
      {
        deletedAt: new Date(),
      }
    );
    processWebhooks('document.removed', { document });
    // @todo update algolia
    return true;
  }

  @Authorized()
  @Mutation(returns => Document)
  public async publishDocument(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context //
  ) {
    const doc = await this.documentRepository.findOneOrFail({ id, deletedAt: IsNull() });
    const publishedId = await this.documentRepository.publish(doc, context.user.id);
    const document = await this.Document(publishedId);
    processWebhooks('document.published', { document });
    // @todo update algolia
    return document;
  }

  @Mutation(returns => Document)
  public async unpublishDocument(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context //
  ) {
    const doc = await this.documentRepository.findOneOrFail({ id, deletedAt: IsNull() });
    this.documentRepository.update(
      {
        documentId: doc.documentId,
        locale: doc.locale,
      },
      {
        publishedAt: null as any,
      }
    );
    // @todo update algolia
    const document = await this.Document(id);
    processWebhooks('document.unpublished', { document });
    return document;
  }

  @FieldResolver(returns => GraphQLJSON, { nullable: true })
  public async data(@Root() document: Document): Promise<any> {
    const schema = await this.schemaRepository.loadOne(document.schemaId);
    return this.documentTransformer.transformOutput(document, schema);
  }

  @FieldResolver(returns => [DocumentVersion], { nullable: true })
  public async versions(@Root() document: Document): Promise<Document[]> {
    return this.documentRepository.find({
      where: { documentId: document.documentId, deletedAt: IsNull() },
      order: { updatedAt: 'DESC' },
    });
  }

  @FieldResolver(returns => Document, {
    nullable: true,
    description: 'Get published version of the document (if any)',
  })
  public async published(@Root() document: Document) {
    return this.documentRepository.loadOneByDocumentId(document.documentId, 'documentId', {
      publishedAt: Raw(alias => `${alias} IS NOT NULL`),
    });
  }

  @FieldResolver(returns => GraphQLJSON, {
    nullable: true,
  })
  public async primary(@Root() document: Document): Promise<any> {
    const qb = this.schemaFieldRepository.createQueryBuilder();
    qb.cache(1000);
    let field = await this.schemaFieldRepository
      .getLoader(
        qb,
        (b, keys) => b.where({ schemaId: In(keys) }).andWhere('SchemaField.primary = TRUE'),
        'schemaId'
      )
      .load(document.schemaId);

    if (field) {
      const path = [field.id];

      if (field.parentFieldId) {
        field = await this.schemaFieldRepository.loadOne(field.parentFieldId);
        if (field) {
          path.push(field.id);
        }
      }

      let value = get(document.data, path.reverse().join('.'));

      if (field && field.primeField) {
        value = field.primeField.processOutput(value);
      }

      return value;
    }

    return null;
  }
}
