import { Column, DataType, Model, PrimaryKey, Table, Default, CreatedAt, UpdatedAt, DeletedAt, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { WebhookCall } from './WebhookCall';
import fetch from 'node-fetch';

const successCodes = [200, 201, 202, 203, 204];

@Table
export class Webhook extends Model<Webhook> {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id;

  @Column(DataType.STRING)
  public name: string;

  @Column(DataType.STRING)
  public url: string;

  @Default('POST')
  @Column(DataType.STRING)
  public method: string;

  @Column(DataType.JSONB)
  public options: any;

  @Column(DataType.UUID)
  public userId: any;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

  @DeletedAt
  @Column
  public deletedAt: Date;

  @BelongsTo(() => User, 'userId')
  public user: User;

  static async run(action: string, body: any) {
    const webhooks = await Webhook.findAll();
    await Promise.all(webhooks.map(async (webhook) => {
      const request = {
        headers: {
          'x-prime-action': action,
          'x-prime-webhook-name': webhook.name,
          'content-type': 'application/json',
          'user-agent': 'prime',
        },
        method: webhook.method,
        url: webhook.url,
        body,
      };
      const response = await fetch(request.url, {
        headers: request.headers,
        method: request.method,
        body: JSON.stringify(request.body),
      });
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      await WebhookCall.create({
        webhookId: webhook.id,
        success: successCodes.indexOf(response.status) >= 0,
        executedAt: new Date(),
        request,
        response: {
          headers,
          body: await response.text(),
          redirected: response.redirected,
          url: response.url,
          type: response.type,
          status: response.status,
          statusText: response.statusText,
        }
      });
    }));
  }
}
