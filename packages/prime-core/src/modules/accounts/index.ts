import { AccountsModule } from '@accounts/graphql-api';
import { AccountsPassword } from '@accounts/password';
import { AccountsServer } from '@accounts/server';
import { AccountsTypeorm, User } from '@accounts/typeorm';
import Mailgun from 'mailgun-js';
import { Connection } from 'typeorm';

const { MAILGUN_API_KEY, MAILGUN_DOMAIN, ACCOUNTS_SECRET, CORE_URL } = process.env;

let mailgun;

if (MAILGUN_API_KEY && MAILGUN_API_KEY !== '') {
  mailgun = Mailgun({
    apiKey: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN,
  });
}

export const createAccounts = async (connection: Connection) => {
  const tokenSecret = ACCOUNTS_SECRET || 'not very secret secret';
  const db = new AccountsTypeorm({
    connection,
    cache: 1000,
  });

  const password = new AccountsPassword<User>({
    twoFactor: {
      appName: 'Prime',
    },
  });

  const accountsServer = new AccountsServer(
    {
      db,
      tokenSecret,
      siteUrl: CORE_URL,
      sendMail(mail) {
        if (mailgun) {
          return mailgun.messages().send(mail);
        }
      },
    },
    { password }
  );

  const accounts = AccountsModule.forRoot({
    accountsServer,
    headerName: 'x-prime-token',
  });

  return accounts;
};
