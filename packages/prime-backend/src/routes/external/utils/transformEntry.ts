export const transformEntry = (entry) => {
  if (!entry) {
    return null;
  }

  return {
    id: entry.entryId,
    _meta: {
      language: entry.language,
      languages: [].concat((entry as any).languages),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    },
    ...entry.data
  };
}
