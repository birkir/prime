import { AccountsClient } from '@accounts/client';
import { AccountsClientPassword } from '@accounts/client-password';
import GraphQLClient from '@accounts/graphql-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { concat } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import { Settings } from '../stores/settings';

const coreUrl: string = Settings.coreUrl;

const httpLink = new HttpLink({
  uri: `${coreUrl}/prime/graphql`,
  credentials: 'include',
});

const withToken = setContext(() => {
  return {
    headers: {
      'x-prime-token': localStorage.getItem('accounts:accessToken'),
    },
  };
});

const client = new ApolloClient({
  link: concat(withToken, httpLink),
  cache: new InMemoryCache(),
});

const accountsGraphQL = new GraphQLClient({ graphQLClient: client });
const accountsClient = new AccountsClient({}, accountsGraphQL);
const accountsPassword = new AccountsClientPassword(accountsClient);

export { accountsClient, accountsGraphQL, accountsPassword };
