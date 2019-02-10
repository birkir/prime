import { Context } from 'apollo-server-core';
import crypto from 'crypto';
import { GraphQLResolveInfo } from 'graphql';
import Hashids from 'hashids';
import { Arg, Args, Ctx, ID, Info, Mutation, Query, Resolver } from 'type-graphql';
import { Repository } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { AccessToken } from '../../../entities/AccessToken';
import { AccessTokenInput } from '../types/AccessTokenInput';
import { ConnectionArgs, createConnectionType } from '../types/createConnectionType';
import { Authorized } from '../utils/Authorized';

const AccessTokenConnection = createConnectionType(AccessToken);

@Resolver(of => AccessToken)
export class AccessTokenResolver {
  @InjectRepository(AccessToken)
  private readonly accessTokenRepository: Repository<AccessToken>;

  @Authorized()
  @Query(returns => AccessToken, { nullable: true, description: 'Get Access Token by ID' })
  public AccessToken(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context,
    @Info() info: GraphQLResolveInfo
  ) {
    return this.accessTokenRepository.findOne(id);
  }

  @Authorized()
  @Query(returns => AccessTokenConnection, { description: 'Get many Access Tokens' })
  public async allAccessTokens(@Args() args: ConnectionArgs) {
    const connection = await new EntityConnection(args, {
      repository: this.accessTokenRepository,
      sortOptions: [{ sort: '"createdAt"', order: 'DESC' }],
    });

    return {
      edges: await connection.edges,
      totalCount: await this.accessTokenRepository.count(),
    };
  }

  @Authorized()
  @Mutation(returns => AccessToken, { description: 'Create Access Token' })
  public async createAccessToken(
    @Arg('input') input: AccessTokenInput,
    @Ctx() context: Context
  ): Promise<AccessToken> {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_.';
    const salt = String(process.env.HASHID_SALT || 'keyboard dart cat');
    const hash = crypto.createHmac('sha512', salt);
    const hashid = new Hashids(salt, 108, alphabet);
    hash.update(`${Math.floor(1000 * Math.random())}|${Date.now()}`);
    const accessToken = this.accessTokenRepository.create(input);
    const tokenSeed = hash.digest('hex').match(/.{1,8}/g) || [];
    const token = hashid.encode(tokenSeed.map(num => parseInt(num, 16)));
    if (!tokenSeed.length || token === '') {
      throw new Error('Failed to generate access token');
    }
    accessToken.token = token;
    accessToken.userId = context.user.id;
    await this.accessTokenRepository.save(accessToken);
    return accessToken;
  }

  @Authorized()
  @Mutation(returns => Boolean, { description: 'Remove Access Token by ID' })
  public async removeAccessToken(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context
  ): Promise<boolean> {
    const accessToken = await this.accessTokenRepository.findOneOrFail(id);
    return Boolean(await this.accessTokenRepository.remove(accessToken));
  }
}
