export const transformEntry = (entry) => {
  if (!entry) {
    return null;
  }

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
