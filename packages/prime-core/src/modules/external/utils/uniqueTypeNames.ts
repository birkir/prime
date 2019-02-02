const cache = new Set();

export const uniqueTypeName = (name, i = 0) => {
  const typeName = `${name}${i > 0 ? i : ''}`;
  if (cache.has(typeName)) {
    return uniqueTypeName(name, i + 1);
  }
  cache.add(typeName);
  return typeName;
};

export const resetTypeNames = () => {
  cache.clear();
  cache.add('Order');
};
