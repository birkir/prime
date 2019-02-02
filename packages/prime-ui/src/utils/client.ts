import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, concat } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { Settings } from '../stores/settings';

const coreUrl: string = Settings.coreUrl;

const httpLink = new HttpLink({
  uri: `${coreUrl}/prime/graphql`,
  credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('accounts:accessToken');
  operation.setContext({
    headers: {
      'x-prime-token': token,
    },
  });
  if (forward) {
    return forward(operation);
  }
  return null;
});

export const client = new ApolloClient({
  link: concat(authLink, httpLink),
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
