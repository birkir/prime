import { EntityRepository } from 'typeorm';
import { Webhook } from '../../../entities/Webhook';
import { DataLoaderRepository } from '../../../utils/DataLoaderRepository';

@EntityRepository(Webhook)
export class WebhookRepository extends DataLoaderRepository<Webhook> {}
