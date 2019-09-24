import { AuthenticationError } from 'apollo-server-core';
import { UseMiddleware } from 'type-graphql';
import { Context } from '../../../interfaces/Context';

export function Authorized(ruleFn?: any) {
  return UseMiddleware(
    async ({ args, context, info }: { args: any; context: Context; info: any }, next) => {
      const { session = {} } = info || {};
      if (!context.user && !session.user) {
        throw new AuthenticationError('Must be authenticated');
      }

      if (ruleFn) {
        ruleFn(
          {
            can: (action: string, subject: any, field?: string) => {
              context.ability.throwUnlessCan(action, subject, field);
            },
          },
          args
        );
      }

      return next();
    }
  );
}
