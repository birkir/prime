import { getRepository } from 'typeorm';
import { Document } from '../../../entities/Document';
import { SchemaPayload } from '../interfaces/SchemaPayload';
import { documentWhereBuilder, NestedWhere } from '../utils/documentWhereBuilder';
import { FindAllConnection } from '../utils/FindAllConnection';
import { getSortOptions, NestedSort } from '../utils/sortOptions';

const getDefaultLocale = () => 'en';

interface Args {
  where?: NestedWhere[];
  sort?: NestedSort[];
  locale?: string;
  first?: number | null;
  last?: number | null;
  after?: string | null;
  before?: string | null;
}

export const createAllDocumentResolver = async ({
  schema,
  fields,
  documentTransformer,
}: SchemaPayload) => {
  const documentRepository = getRepository(Document);

  return async (root, args: Args, context, info) => {
    const locale = args.locale || (await getDefaultLocale());
    const published = true;

    FindAllConnection.prototype.resolveNode = async node => {
      const data = await documentTransformer.transformOutput(node, schema, fields);
      return {
        ...data,
        _meta: node,
        id: node.documentId,
      };
    };

    const sortOptions = getSortOptions('Document', fields, args.sort || []);
    if (sortOptions.length === 0) {
      sortOptions.push({ sort: '"createdAt"', order: 'DESC' });
    }
    sortOptions.push({ sort: '"id"', order: 'DESC' });

    const connection = new FindAllConnection(args, {
      where: (qb, count = false) => {
        const sqb = qb
          .subQuery()
          .select('id')
          .from(Document, 'd')
          .where('d.documentId = Document.documentId');

        if (!count) {
          qb.addSelect(
            fqb =>
              fqb
                .subQuery()
                .select('array_agg(DISTINCT "locale")') // @todo postgres only
                .from(Document, 'd')
                .where('d.documentId = Document.documentId')
                .andWhere(`Document.publishedAt IS ${published ? 'NOT' : ''} NULL`)
                .andWhere(`Document.deletedAt IS NULL`),
            'locales'
          );
        }

        qb.andWhere('Document.locale = :locale', { locale });
        qb.andWhere(`Document.publishedAt IS ${published ? 'NOT' : ''} NULL`);
        qb.andWhere(`Document.deletedAt IS NULL`);

        sqb.andWhere('d.locale = :locale', { locale });
        sqb.andWhere(`d.publishedAt IS ${published ? 'NOT' : ''} NULL`);
        sqb.andWhere(`d.deletedAt IS NULL`);

        (args.where || []).map(n => {
          documentWhereBuilder('Document', fields, qb, n);
          documentWhereBuilder('d', fields, sqb, n);
        });

        sqb.orderBy({ 'd.createdAt': 'DESC' }).limit(1);
        if (!count) {
          qb.having(`Document.id = ${sqb.getQuery()}`);
          qb.groupBy('Document.id');
        }
      },
      repository: documentRepository,
      sortOptions,
    });

    connection.totalCount = await connection
      .createAppliedQueryBuilder()
      .cache(2000)
      .getCount();

    return connection;
  };
};
