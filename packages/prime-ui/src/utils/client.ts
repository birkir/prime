import { message } from 'antd';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import { Settings } from '../stores/settings';
import { accountsClient } from './accounts';

const coreUrl: string = Settings.coreUrl;

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(graphQLError => {
      if (graphQLError.extensions && graphQLError.extensions.code === 'FORBIDDEN') {
        message.error('Forbidden: ' + graphQLError.message);
      } else {
        console.log(`[GraphQL error]: Message: ${graphQLError.message}, %o`, graphQLError); // tslint:disable-line no-console
      }
    });
  }

  if (networkError) {
    console.log(`[Network error]: %o`, networkError); // tslint:disable-line no-console
    message.error('Network error');
  }
});

const httpLink = new HttpLink({
  uri: `${coreUrl}/prime/graphql`,
  credentials: 'include',
});

const withToken = setContext(async (input, b) => {
  let tokens;
  try {
    tokens = await accountsClient.refreshSession();
  } catch (err) {
    (window as any).location = '/';
  }
  return {
    headers: {
      'x-prime-token': tokens ? tokens.accessToken : '',
    },
  };
});

export const client = new ApolloClient({
  link: ApolloLink.from([withToken, errorLink, httpLink]),
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
