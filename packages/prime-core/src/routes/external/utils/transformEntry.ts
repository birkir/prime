import { entryTransformer } from '../index';

export const transformEntry = async (entry) => {
  if (!entry) {
    return null;
  }

  entry.data = await entryTransformer.transformOutput(entry.data, entry.contentTypeId);

  return {
    id: entry.entryId,
    _meta: {
      language: entry.language,
      languages: [].concat(entry.dataValues.languages),
      isPublished: entry.isPublished,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString()
    },
    ...entry.data
  };
};
