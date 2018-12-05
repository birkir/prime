import { get } from 'lodash';
import { client } from './client';
import gql from 'graphql-tag';

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  isProd,
  coreUrl: isProd ? '/' : 'http://localhost:4000',
};

export const getConfig = () => client.query({
  query: gql`query { getConfig }`
})
.then(({ data }) => {
  if (data && (data as any).getConfig) {
    Object.assign(config, (data as any).getConfig);
  }
});

const sourceConfig = get(window, 'prime.config', '');
if (sourceConfig === '$PRIME_CONFIG$' || sourceConfig === '') {
  if (process.env.NODE_ENV !== 'development') {
    console.error('$PRIME_CONFIG$ variable not set');
  }
} else {
  try {
    const primeConfig = JSON.parse(sourceConfig);
    Object.assign(config, primeConfig);
  } catch (err) {
    console.error('Could not parse prime config');
  }
}
