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
import { ConnectionArgs, createConnectionType } from '../../../utils/createConnectionType';
import { WebhookRepository } from '../repositories/WebhookRepository';
import { User } from '../types/User';
import { WebhookCall } from '../types/WebhookCall';
import { WebhookInput } from '../types/WebhookInput';

const WebhookConnection = createConnectionType(Webhook);

enum WebhookOrder {
  id_ASC,
  id_DESC,
  name_ASC,
  name_DESC,
}

registerEnumType(WebhookOrder, {
  name: 'WebhookOrderStuff',
});

@Resolver(of => Webhook)
export class WebhookResolver {
  @InjectRepository(WebhookRepository)
  private readonly webhookRepository: WebhookRepository;
  @InjectRepository(WebhookCall)
  private readonly webhookCallRepository: Repository<WebhookCall>;

  @Query(returns => String)
  public test() {
    return '1';
  }

  @Query(returns => Webhook, { nullable: true })
  public Webhook(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context,
    @Info() info: GraphQLResolveInfo
  ) {
    return this.webhookRepository.loadOne(id);
  }

  @Subscription({ topics: 'WEBHOOK_ADDED' })
  public webhookAdded(@Root() payload: Webhook): Webhook {
    return payload;
  }

  @Query(returns => WebhookConnection)
  public allWebhooks(
    @Args() args: ConnectionArgs,
    @Arg('order', type => WebhookOrder, { defaultValue: 0 }) orderBy: string
  ) {
    const [sort, order]: any = orderBy.split('_');
    return new EntityConnection(args, {
      repository: this.webhookRepository,
      sortOptions: [{ sort, order }],
    });
  }

  @Mutation(returns => Webhook)
  public async createWebhook(
    @Arg('input') input: WebhookInput,
    @Ctx() context: Context
  ): Promise<Webhook> {
    const webhook = this.webhookRepository.create(input);
    await this.webhookRepository.save(webhook);
    return webhook;
  }

  @Mutation(returns => Webhook)
  public async updateWebhook(
    @Arg('id') webhookId: string,
    @Arg('input') input: WebhookInput,
    @Ctx() context: Context
  ): Promise<Webhook> {
    const webhook = await this.webhookRepository.findOneOrFail(webhookId);
    return this.webhookRepository.merge(webhook, input);
  }

  @Mutation(returns => Boolean)
  public async removeWebhook(
    @Arg('id') webhookId: string,
    @Ctx() context: Context
  ): Promise<boolean> {
    const webhook = await this.webhookRepository.findOneOrFail(webhookId);
    return Boolean(this.webhookRepository.remove(webhook));
  }

  @FieldResolver(returns => [WebhookCall])
  public calls(@Root() webhook: Webhook): Promise<WebhookCall[]> {
    return this.webhookCallRepository.find({
      cache: 1000,
      where: { webhook },
    });
  }

  @FieldResolver(returns => User)
  public user(@Root() webhook: Webhook): Promise<User> {
    return getRepository(User).findOneOrFail({
      cache: 1000,
      where: webhook.user,
    });
  }
}
