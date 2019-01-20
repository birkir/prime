export const Sentry = (() => {
  try {
    return require('@sentry/node');
  } catch (err) {
    // noop
  }
  return null;
})();
