import { getRepository, IsNull, Raw } from 'typeorm';
import { Document } from '../../../entities/Document';
import { SchemaPayload } from '../interfaces/SchemaPayload';

const getDefaultLocale = () => 'en';

export const createDocumentResolver = async ({
  name,
  schema,
  fields,
  documentTransformer,
}: SchemaPayload) => {
  const documentRepository = getRepository(Document);

  return async (root, args: { id: string; locale?: string }, context, info) => {
    const key = args.id.length === 36 ? 'id' : 'documentId';
    const locale = args.locale || (await getDefaultLocale());
    const single = schema.settings.single;
    const published = true;
    const where = {
      ...(!single && { [key]: args.id }),
      ...((single || key === 'documentId') && {
        locale,
        publishedAt: Raw(alias => `${alias} IS ${published ? 'NOT' : ''} NULL`),
      }),
      schemaId: schema.id,
      deletedAt: IsNull(),
    };

    const doc = await documentRepository.findOne({
      where,
      order: {
        createdAt: 'DESC',
      },
    });

    if (doc) {
      const data = await documentTransformer.transformOutput(doc, schema, fields);

      const locales = await documentRepository
        .createQueryBuilder('d')
        .select('d.locale')
        .where('d.documentId = :documentId', { documentId: doc.documentId })
        .where(`d.publishedAt IS ${published ? 'NOT' : ''} NULL`)
        .groupBy('d.locale')
        .getRawMany();

      const meta = {
        ...doc,
        locales: locales.map(d => d.d_locale),
      };

      return { id: doc.documentId, _meta: meta, ...data, __typeOf: name };
    }
  };
};
