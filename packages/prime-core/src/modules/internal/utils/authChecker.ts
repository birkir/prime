import { AuthChecker } from 'type-graphql';
import { Context } from '../../../interfaces/Context';

export const authChecker: AuthChecker<Context> = ({ root, args, context, info }, roles) => {
  if (!context.user) {
    return false;
  }

  return true;
};
