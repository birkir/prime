export const noUndefinedTypeOf = (item, key) => {
  if (typeof item.__isTypeOf === 'undefined') {
    delete item.__isTypeOf;
  }
  return item;
};
