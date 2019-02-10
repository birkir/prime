import { ForbiddenError as AbilityForbiddenError } from '@casl/ability';
import { ForbiddenError } from 'apollo-server-core';
import { MiddlewareFn } from 'type-graphql';

export const abilityForbiddenMiddleware: MiddlewareFn<any> = async ({ context, info }, next) => {
  try {
    return await next();
  } catch (err) {
    if (err instanceof AbilityForbiddenError) {
      throw new ForbiddenError(err.message);
    }
    throw err;
  }
};
