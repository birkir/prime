import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { concat } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import { Settings } from '../stores/settings';
import { accountsClient } from './accounts';

const coreUrl: string = Settings.coreUrl;

const httpLink = new HttpLink({
  uri: `${coreUrl}/prime/graphql`,
  credentials: 'include',
});

const withToken = setContext(() => {
  return accountsClient.refreshSession().then(tokens => {
    return {
      headers: {
        'x-prime-token': tokens ? tokens.accessToken : '',
      },
    };
  });
});

export const client = new ApolloClient({
  link: concat(withToken, httpLink),
  cache: new InMemoryCache(),
});

client.defaultOptions = {
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
  mutate: {
    errorPolicy: 'all',
  },
};
