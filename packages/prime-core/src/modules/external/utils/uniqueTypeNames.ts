const cache = new Set();

export const uniqueTypeName = (name, i = 0) => {
  if (cache.has(name)) {
    return uniqueTypeName(`${name}${i + 1}`, i + 1);
  }
  cache.add(name);
  return name;
};

export const clearTypeNames = () => {
  cache.clear();
};
