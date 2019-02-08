import { AuthChecker } from 'type-graphql';
import { log } from '..';
import { Context } from '../../../interfaces/Context';

export const authChecker: AuthChecker<Context> = ({ root, args, context, info }, roles) => {
  if (!context.user) {
    return false;
  }

  if (context.ability && typeof roles[0] === 'function') {
    try {
      if (!(roles as any)[0](context.ability, args)) {
        return false;
      }
    } catch (err) {
      log(err);
      return false;
    }
  }

  return true;
};
