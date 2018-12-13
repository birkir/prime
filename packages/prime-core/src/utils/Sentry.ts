export const Sentry = (() => {
  try {
    return require('@sentry/node');
  } catch (err) {}
  return null;
})();
