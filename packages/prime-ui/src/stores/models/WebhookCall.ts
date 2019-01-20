import { types } from 'mobx-state-tree';

export const WebhookCall = types.model('WebhookCall', {
  id: types.identifier,
  success: types.boolean,
  request: types.frozen(),
  response: types.frozen(),
});
