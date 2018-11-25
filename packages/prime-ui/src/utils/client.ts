import ApolloClient from 'apollo-boost';

const ENDPOINT = 'http://localhost:4000';

export const client = new ApolloClient({
  uri: `${ENDPOINT}/internal/graphql`,
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
