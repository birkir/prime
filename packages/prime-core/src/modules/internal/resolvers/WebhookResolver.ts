import { Context } from 'apollo-server-core';
import { GraphQLResolveInfo } from 'graphql';
import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  ID,
  Info,
  Mutation,
  Query,
  registerEnumType,
  Resolver,
  Root,
  Subscription,
} from 'type-graphql';
import { getRepository, Repository } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Webhook } from '../../../entities/Webhook';
import { WebhookCall } from '../../../entities/WebhookCall';
import { WebhookRepository } from '../repositories/WebhookRepository';
import { ConnectionArgs, createConnectionType } from '../types/createConnectionType';
import { User } from '../types/User';
import { WebhookInput } from '../types/WebhookInput';
import { Authorized } from '../utils/Authorized';

const WebhookConnection = createConnectionType(Webhook);

enum WebhookOrder {
  id_ASC,
  id_DESC,
  name_ASC,
  name_DESC,
}

registerEnumType(WebhookOrder, {
  name: 'WebhookConnectionOrder',
});

@Resolver(of => Webhook)
export class WebhookResolver {
  @InjectRepository(WebhookRepository)
  private readonly webhookRepository: WebhookRepository;
  @InjectRepository(WebhookCall)
  private readonly webhookCallRepository: Repository<WebhookCall>;

  @Authorized()
  @Query(returns => Webhook, { nullable: true, description: 'Get Webhook by ID' })
  public Webhook(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context,
    @Info() info: GraphQLResolveInfo
  ) {
    return this.webhookRepository.loadOne(id);
  }

  @Subscription({
    topics: 'WEBHOOK_ADDED',
    description: 'Get latest Webhook as a subscription',
  })
  public webhookAdded(@Root() payload: Webhook): Webhook {
    return payload;
  }

  @Authorized()
  @Query(returns => WebhookConnection, { description: 'Get many Webhooks' })
  public async allWebhooks(
    @Args() args: ConnectionArgs,
    @Arg('order', type => WebhookOrder, { defaultValue: 0 }) orderBy: string
  ) {
    const [sort, order]: any = orderBy.split('_');
    const connection = await new EntityConnection(args, {
      repository: this.webhookRepository,
      sortOptions: [{ sort, order }],
    });
    return {
      edges: await connection.edges,
      totalCount: await this.webhookRepository.count(),
    };
  }

  @Authorized()
  @Mutation(returns => Webhook, { description: 'Create Webhook' })
  public async createWebhook(
    @Arg('input') input: WebhookInput,
    @Ctx() context: Context
  ): Promise<Webhook> {
    const webhook = this.webhookRepository.create(input);
    await this.webhookRepository.save(webhook);
    return webhook;
  }

  @Mutation(returns => Webhook, { description: 'Update Webhook by ID' })
  public async updateWebhook(
    @Arg('id', type => ID) id: string,
    @Arg('input') input: WebhookInput,
    @Ctx() context: Context
  ): Promise<Webhook> {
    const entity = await this.webhookRepository.findOneOrFail(id);
    await this.webhookRepository.merge(entity, input);
    await this.webhookRepository.save(entity);
    return entity;
  }

  @Authorized()
  @Mutation(returns => Boolean, { description: 'Remove Webhook by ID' })
  public async removeWebhook(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context
  ): Promise<boolean> {
    const entity = await this.webhookRepository.findOneOrFail(id);
    return Boolean(await this.webhookRepository.remove(entity));
  }

  @FieldResolver(returns => [WebhookCall], { description: 'Get many Webhook calls' })
  public calls(@Root() webhook: Webhook): Promise<WebhookCall[]> {
    return this.webhookCallRepository.find({
      cache: 1000,
      where: { webhook },
    });
  }

  @FieldResolver(returns => User, { description: 'Get Webhook User' })
  public user(@Root() webhook: Webhook): Promise<User> {
    return getRepository(User).findOneOrFail({
      cache: 1000,
      where: webhook.user,
    });
  }
}
