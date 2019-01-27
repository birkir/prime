import { EntityRepository } from 'typeorm';
import { Webhook } from '../../../entities/Webhook';
import { DataLoaderRepository } from './DataLoaderRepository';

@EntityRepository(Webhook)
export class WebhookRepository extends DataLoaderRepository<Webhook> {}
