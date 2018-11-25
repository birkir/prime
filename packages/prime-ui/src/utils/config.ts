import { get } from 'lodash';

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  isProd,
  coreUrl: isProd ? '/' : 'http://localhost:4000',
};

const sourceConfig = get(window, 'prime.config', '');
if (sourceConfig === '$PRIME_CONFIG$' || sourceConfig === '') {
  console.error('$PRIME_CONFIG$ variable not set');
} else {
  try {
    const primeConfig = JSON.parse(sourceConfig);
    Object.assign(config, primeConfig);
  } catch (err) {
    console.error('Could not parse prime config');
  }
}
