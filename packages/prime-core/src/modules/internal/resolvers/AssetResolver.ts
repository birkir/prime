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
} from 'type-graphql';
import Container from 'typedi';
import { getRepository } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Asset } from '../../../entities/Asset';
import { S3Storage } from '../../../utils/S3Storage';
import { AssetRepository } from '../repositories/AssetRepository';
import { AssetInput } from '../types/AssetInput';
import { ConnectionArgs, createConnectionType } from '../types/createConnectionType';
import { User } from '../types/User';
import { Authorized } from '../utils/Authorized';

const AssetConnection = createConnectionType(Asset);

enum AssetOrder {
  updatedAt_ASC,
  updatedAt_DESC,
  id_ASC,
  id_DESC,
  fileName_ASC,
  fileName_DESC,
}

registerEnumType(AssetOrder, {
  name: 'AssetConnectionOrder',
});

@Resolver(of => Asset)
export class AssetResolver {
  @InjectRepository(AssetRepository)
  private readonly assetRepository: AssetRepository;
  private readonly storage: S3Storage;

  constructor() {
    this.storage = Container.get(S3Storage);
  }

  @Authorized()
  @Query(returns => Asset, { nullable: true, description: 'Get Asset by ID' })
  public Asset(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context,
    @Info() info: GraphQLResolveInfo
  ) {
    return this.assetRepository.loadOne(id);
  }

  @Authorized()
  @Query(returns => AssetConnection, { description: 'Get many Assets' })
  public async allAssets(
    @Args() args: ConnectionArgs,
    @Arg('order', type => AssetOrder, { defaultValue: 0 }) orderBy: string
  ) {
    const [sort, order]: any = orderBy.split('_');
    const connection = await new EntityConnection(args, {
      repository: this.assetRepository,
      sortOptions: [{ sort: `Asset.${sort}`, order }],
    });
    return {
      edges: await connection.edges,
      totalCount: await this.assetRepository.count(),
    };
  }

  @Authorized()
  @Mutation(returns => Asset, { description: 'Create Asset' })
  public async createAsset(
    @Arg('input') input: AssetInput,
    @Ctx() context: Context
  ): Promise<Asset> {
    const upload = await input.upload;
    const assetInput = await this.storage.upload(upload.filename, upload.createReadStream());
    const asset = this.assetRepository.create(assetInput);
    await this.assetRepository.save(asset);
    return asset;
  }

  @Authorized()
  @Mutation(returns => Boolean, { description: 'Remove Asset by ID' })
  public async removeAsset(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context
  ): Promise<boolean> {
    const entity = await this.assetRepository.findOneOrFail(id);
    await this.storage.delete(entity.fileName);
    return Boolean(await this.assetRepository.remove(entity));
  }

  @FieldResolver(returns => User, { description: 'Get Asset User' })
  public user(@Root() asset: Asset): Promise<User> {
    return getRepository(User).findOneOrFail({
      cache: 1000,
      where: asset.user,
    });
  }
}
