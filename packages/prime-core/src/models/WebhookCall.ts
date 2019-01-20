import { BelongsTo, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Webhook } from './Webhook';

@Table
export class WebhookCall extends Model<WebhookCall> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id;

  @Column(DataType.UUID)
  public webhookId: any;

  @Column(DataType.BOOLEAN)
  public success: any;

  @Column(DataType.INTEGER)
  public status: number;

  @Column(DataType.JSONB)
  public request: any;

  @Column(DataType.JSONB)
  public response: any;

  @Column
  public executedAt: Date;

  @BelongsTo(() => Webhook, {
    foreignKey: 'webhookId',
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  public webhook: Webhook;
}
