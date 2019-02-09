import { AuthenticationError } from 'apollo-server-core';
import { UseMiddleware } from 'type-graphql';
import { Context } from '../../../interfaces/Context';

export function Authorized(ruleFn?: any) {
  return UseMiddleware(async ({ args, context }: { args: any; context: Context }, next) => {
    if (!context.user) {
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
  });
}
