import ApolloClient from 'apollo-boost';
import { Settings } from '../stores/settings';

const coreUrl: string = Settings.coreUrl;

export const client = new ApolloClient({
  uri: `${coreUrl}/internal/graphql`,
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
