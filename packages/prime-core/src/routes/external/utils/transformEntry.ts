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
      published: entry.isPublished,
      timestamp: entry.updatedAt.toISOString(),
      versionId: entry.versionId,
    },
    ...entry.data
  };
};
