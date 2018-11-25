import ApolloClient from 'apollo-boost';
import { config }  from './config';

export const client = new ApolloClient({
  uri: `${config.coreUrl}/internal/graphql`,
  credentials: 'include',
});

client.defaultOptions = {
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
  mutate: {
    errorPolicy: 'all'
  },
};
