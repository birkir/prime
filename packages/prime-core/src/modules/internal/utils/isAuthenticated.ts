export const isAuthenticated = () => next => async (root, args, context, info) => {
  // if (!context.user) {
  //   throw new Error('No authentication');
  // }
  return next(root, args, context, info);
};
