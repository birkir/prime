import { AuthenticationError } from 'apollo-server-core';
import { acl } from '../../../acl';

export const ensurePermitted = async (context, contentType, allowed = 'read') => {
  if (!context.public) {
    if (!await acl.isAllowed(context.user.id, `ContentType.${contentType.id}`, allowed)) {
      throw new AuthenticationError('Insufficient permissions');
    }
  }
};
