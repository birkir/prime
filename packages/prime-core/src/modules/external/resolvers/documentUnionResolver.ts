import { startCase } from 'lodash';
import { getRepository } from 'typeorm';
import { Document } from '../../../entities/Document';
import { Schema } from '../../../entities/Schema';

const getDefaultLocale = () => 'en';

export const documentUnionResolver = (resolvers: { [key: string]: any }) => async (
  root,
  args: { id: string; locale?: string },
  context,
  info
) => {
  const locale = args.locale || (await getDefaultLocale());
  const documentRepository = getRepository(Document);
  const schemaRepository = getRepository(Schema);
  const doc = await documentRepository.findOne({
    documentId: args.id,
    locale,
  });
  if (doc) {
    const schema = await schemaRepository.findOneOrFail(doc.schemaId);
    const schemaName = startCase(schema.name);
    if (resolvers[schemaName]) {
      return resolvers[schemaName](root, args, context, info);
    }
  }
  return null;
};
