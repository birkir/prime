import { getRepository, Raw } from 'typeorm';
import { Document } from '../../../entities/Document';
import { Schema } from '../../../entities/Schema';
import { DocumentTransformer } from '../../../utils/documentTransformer';

const getDefaultLocale = () => 'en';

export const createFindResolver = async ({ schema }: { schema: Schema }) => {
  const documentRepository = getRepository(Document);
  const documentTransformer = new DocumentTransformer();

  const fields = await documentTransformer.getFields(schema);

  return async (root, args: { id: string; locale?: string }, context, info) => {
    const locale = args.locale || (await getDefaultLocale());
    const published = true;

    const doc = await documentRepository.findOneOrFail({
      where: {
        documentId: args.id,
        locale,
        publishedAt: Raw(name => `${name} IS ${published ? 'NOT' : ''} NULL`),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return await documentTransformer.transformOutput(doc, schema, fields);
  };
};
