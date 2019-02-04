import { getRepository } from 'typeorm';
import { Document } from '../../../entities/Document';
import { getUniqueHashId } from '../../../utils/getUniqueHashId';
import { getDefaultLocale } from '../index';
import { SchemaPayload } from '../interfaces/SchemaPayload';

export const createDocumentCreateResolver = async (payload: SchemaPayload) => {
  const documentRepository = getRepository(Document);

  return async (root, args: { locale?: string; input: any }, context, info) => {
    // insert, then
    const locale = args.locale || (await getDefaultLocale());

    const data = await payload.documentTransformer.transformInput(
      args.input,
      payload.schema,
      payload.fields
    );

    // @todo userId
    const document = await documentRepository.insert({
      data,
      locale,
      schemaId: payload.schema.id,
      documentId: await getUniqueHashId(documentRepository, 'documentId'),
    });

    const doc = document.identifiers.pop() || { id: null };

    return payload.resolvers[payload.name](root, { id: doc.id }, context, info);
  };
};
