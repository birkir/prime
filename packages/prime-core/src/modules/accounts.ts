import { AccountsModule } from '@accounts/graphql-api';
import { AccountsPassword } from '@accounts/password';
import { AccountsServer } from '@accounts/server';
import { AccountsTypeorm } from '@accounts/typeorm';
import { Connection } from 'typeorm';

export const createAccounts = async (connection: Connection) => {
  const tokenSecret = process.env.ACCOUNTS_SECRET || 'not very secret secret';
  const db = new AccountsTypeorm({ connection });
  const password = new AccountsPassword();
  const accountsServer = new AccountsServer(
    {
      db,
      tokenSecret,
    },
    { password }
  );
  const accounts = AccountsModule.forRoot({
    accountsServer,
    headerName: 'x-prime-token',
  });
  return accounts;
};
