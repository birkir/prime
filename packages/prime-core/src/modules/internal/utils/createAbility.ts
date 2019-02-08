import { AbilityBuilder } from '@casl/ability';
import { Context } from '../../../interfaces/Context';

export const createAbility = (context: Context) => {
  return AbilityBuilder.define((can, cannot) => {
    can('read', 'User');
    can('read', 'allUsers');
    cannot('create', 'User');
    cannot('delete', 'User').because('You cannot remove users');
    cannot('update', 'User').because('You can only update your own user');
    can('update', 'User', { id: context.user.id });
  });
};
