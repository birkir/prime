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
      where: (qb, isCount = false) => {
        const sqb = qb
          .subQuery()
          .select('id')
          .from(Document, 'd')
          .where('d.documentId = Document.documentId');

        if (!isCount) {
          qb.addSelect(fqb => {
            const ffqb = fqb
              .subQuery()
              .select('array_agg(DISTINCT "locale")') // @todo postgres only
              .from(Document, 'd')
              .where('d.documentId = Document.documentId');
            if (!context.preview) {
              ffqb.andWhere(`Document.publishedAt IS NOT NULL`);
            }
            ffqb.andWhere(`Document.deletedAt IS NULL`);
            return ffqb;
          }, 'locales');
        }

        qb.andWhere('Document.locale = :locale', { locale });
        if (!context.preview) {
          qb.andWhere(`Document.publishedAt IS NOT NULL`);
        }
        qb.andWhere(`Document.deletedAt IS NULL`);

        sqb.andWhere('d.locale = :locale', { locale });
        if (!context.preview) {
          sqb.andWhere(`d.publishedAt IS NOT NULL`);
        }
        sqb.andWhere(`d.deletedAt IS NULL`);

        (args.where || []).map(n => {
          documentWhereBuilder('Document', fields, qb, n);
          documentWhereBuilder('d', fields, sqb, n);
        });

        sqb.orderBy({ 'd.createdAt': 'DESC' }).limit(1);

        if (!isCount) {
          qb.having(`Document.id = ${sqb.getQuery()}`);
          qb.groupBy('Document.id');
        } else {
          qb.groupBy('Document.documentId');
        }
      },
      repository: documentRepository,
      sortOptions,
    });

    const { count } = await connection
      .createAppliedQueryBuilder(true)
      .select('COUNT(DISTINCT Document.documentId)')
      .cache(2000)
      .getRawOne();

    connection.totalCount = Number(count || -1);

    return connection;
  };
};
