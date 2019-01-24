import algoliasearch from 'algoliasearch';

const { ALGOLIASEARCH_APPLICATION_ID = '', ALGOLIASEARCH_API_KEY = '' } = process.env;

export const algolia = {
  client: null as any,
  index: null as any,
};

if (ALGOLIASEARCH_APPLICATION_ID !== '' && ALGOLIASEARCH_API_KEY !== '') {
  algolia.client = algoliasearch(ALGOLIASEARCH_APPLICATION_ID, ALGOLIASEARCH_API_KEY);
  algolia.index = algolia.client.initIndex('primecms');
}
