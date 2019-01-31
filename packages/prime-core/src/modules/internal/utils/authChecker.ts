import { AuthChecker } from 'type-graphql';

type Context = any;

export const authChecker: AuthChecker<Context> = ({ root, args, context, info }, roles) => {
  if (!context.user) {
    return false;
  }
  return true;
};
