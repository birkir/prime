import { AbilityBuilder } from '@casl/ability';
import { Context } from '../../../interfaces/Context';

export const createAbility = (context: Context) => {
  return AbilityBuilder.define((can, cannot) => {
    const userId = context.user.id;
    const role = (() => 'editor')();

    if (context.user) {
      can('update', 'User', { id: userId });
    }

    if (role === 'admin') {
      can('manage', 'all');
    }

    if (role === 'editor') {
      can('list', 'User');
      // can('read', 'User');
      // can('create', 'User');
      // can('delete', 'User');
      // can('update', 'User');
    }

    // Some ideas...

    // Can update own Blog posts
    // can('update', 'Document', { schemaId: 'blog', userId })

    // Can create Blog posts but not publish them
    // can('create', 'Document', { schemaId: 'blog' })
    // cannot('publish', 'Document', { schemaId: 'blog' })

    // Can create schemas
    // can('create', 'Schema')
  });
};
