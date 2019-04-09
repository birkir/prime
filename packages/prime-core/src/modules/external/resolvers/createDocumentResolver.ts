import { getRepository, IsNull, Raw } from 'typeorm';
import { Document } from '../../../entities/Document';
import { SchemaPayload } from '../interfaces/SchemaPayload';

const getDefaultLocale = async () => 'en';

export const createDocumentResolver = async ({
  name,
  schema,
  fields,
  documentTransformer,
}: SchemaPayload) => {
  const documentRepository = getRepository(Document);

  return async (root, args: { id: string; locale?: string }, context, info) => {
    const key = args.id && args.id.length === 36 ? 'id' : 'documentId';
    const locale = args.locale || (await getDefaultLocale());
    const single = schema.settings.single;

    const where = {
      ...(!single && { [key]: args.id }),
      ...((single || key === 'documentId') && {
        locale,
        ...(!context.preview && { publishedAt: Raw(alias => `${alias} IS NOT NULL`) }),
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

      const locales = documentRepository
        .createQueryBuilder('d')
        .select('d.locale')
        .where('d.documentId = :documentId', { documentId: doc.documentId });
      if (!context.preview) {
        locales.where(`d.publishedAt IS NOT NULL`);
      }
      locales.groupBy('d.locale');

      const meta = {
        ...doc,
        locales: (await locales.getRawMany()).map(d => d.d_locale),
      };

      return { id: doc.documentId, _meta: meta, ...data, __typeOf: name };
    }
  };
};
