import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Webhook } from './Webhook';

@Entity()
export class WebhookCall {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('boolean')
  public success: boolean;

  @Column('int')
  public status: number;

  @Column('jsonb', { default: {} })
  public request: any;

  @Column('jsonb', { nullable: true })
  public response: any;

  @Column('timestamp')
  public executedAt: Date;

  @ManyToOne(type => Webhook, webhook => webhook.calls)
  public webhook: Webhook;
}
