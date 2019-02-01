import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { Settings } from '../stores/settings';

const coreUrl: string = Settings.coreUrl;

export const client = new ApolloClient({
  link: new HttpLink({
    uri: `${coreUrl}/internal/graphql`,
    credentials: 'include',
  }),
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
