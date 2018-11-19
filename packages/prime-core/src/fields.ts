import { primeConfig } from './utils/primeConfig';

// Resolve fields
export const fields = (primeConfig.fields || []).map((moduleName: string) => {
  try {
    return new (require(moduleName).default)();
  } catch (err) {
    console.error(
      'ERROR: Could not resolve field module',
      '"' + moduleName + '"'
    );
    console.error(err);
  }
  return null;
})
.filter(n => !!n);
