import { GraphQLList } from 'graphql';
import { resolver } from 'graphql-sequelize';
import { Webhook } from '../../../models/Webhook';
import { sequelize } from '../../../sequelize';
import { Webhook as WebhookType } from '../types/Webhook';

const SQL_SUCCESS = `(SELECT COUNT(*) FROM "WebhookCall" "c" WHERE "c"."webhookId" = "Webhook"."id" AND success = TRUE)`;
const SQL_COUNT = `(SELECT COUNT(*) FROM "WebhookCall" "c" WHERE "c"."webhookId" = "Webhook"."id")`;

export const allWebhooks = {
  type: new GraphQLList(WebhookType),
  resolve: resolver(Webhook, {
    async before(options) {
      options.attributes = {
        include: [[sequelize.literal(SQL_SUCCESS), 'success'], [sequelize.literal(SQL_COUNT), 'count']],
      };
      return options;
    },
    after(values) {
      return values.map(({ dataValues }) => dataValues);
    },
  }),
};
