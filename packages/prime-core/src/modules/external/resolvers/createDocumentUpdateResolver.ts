import { UserInputError } from 'apollo-server-core';
import { defaultsDeep } from 'lodash';
import { getRepository, IsNull } from 'typeorm';
import { Document } from '../../../entities/Document';
import { getDefaultLocale } from '../index';
import { SchemaPayload } from '../interfaces/SchemaPayload';

export const createDocumentUpdateResolver = async (payload: SchemaPayload) => {
  const documentRepository = getRepository(Document);

  return async (
    root,
    args: { id: string; locale?: string; merge?: boolean; input: any },
    context,
    info
  ) => {
    const key = args.id.length === 36 ? 'id' : 'documentId';
    const locale = args.locale || (await getDefaultLocale());

    // @todo only allow to merge published?
    let doc = await documentRepository.findOne({
      where: {
        [key]: args.id,
        ...(key === 'documentId' && { locale }),
        deletedAt: IsNull(),
        schemaId: payload.schema.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!doc && key === 'documentId') {
      doc = await documentRepository.findOne({
        where: { documentId: args.id, deletedAt: IsNull() },
        order: {
          createdAt: 'DESC',
        },
      });
    }

    if (!doc) {
      throw new UserInputError('Document not found');
    }

    const data = await payload.documentTransformer.transformInput(
      args.input,
      payload.schema,
      payload.fields
    );

    if (args.merge) {
      defaultsDeep(
        data,
        await payload.documentTransformer.transformInput(doc.data, payload.schema, payload.fields)
      );
    }

    // @todo userId
    const document = await documentRepository.insert({
      data,
      locale,
      schemaId: payload.schema.id,
      documentId: doc.documentId,
    });

    const res = document.identifiers.pop() || { id: null };

    return payload.resolvers[payload.name](root, { id: res.id }, context, info);
  };
};
