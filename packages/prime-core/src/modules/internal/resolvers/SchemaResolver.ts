import { defaultsDeep } from 'lodash';
import { Arg, Args, FieldResolver, ID, Mutation, Query, Resolver, Root } from 'type-graphql';
import { getRepository, Raw } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Document } from '../../../entities/Document';
import { Schema, SchemaVariant } from '../../../entities/Schema';
import { processWebhooks } from '../../../utils/processWebhooks';
import { pubSub } from '../../../utils/pubSub';
import { SchemaRepository } from '../repositories/SchemaRepository';
import { ConnectionArgs, createConnectionType } from '../types/createConnectionType';
import { SchemaFieldGroup } from '../types/SchemaFieldGroup';
import { SchemaInput } from '../types/SchemaInput';
import { Authorized } from '../utils/Authorized';
import { getSchemaFields } from '../utils/getSchemaFields';
import { setSchemaFields } from '../utils/setSchemaFields';

const SchemaConnection = createConnectionType(Schema);
const parseEnum = (Enum, value: number) => Enum[(value as unknown) as string];

@Resolver(of => Schema)
export class SchemaResolver {
  @InjectRepository(SchemaRepository)
  private readonly schemaRepository: SchemaRepository;

  @Authorized()
  @Query(returns => Schema, { nullable: true, description: 'Get Schema by ID' })
  public async Schema(
    @Arg('id', type => ID, { nullable: true }) id: string,
    @Arg('name', { nullable: true }) name: string
  ) {
    let res;
    if (name) {
      res = await this.schemaRepository.findOne({
        name: Raw(alias => `lower(${alias}) = lower('${name.replace(/[\W_]+/g, '')}')`),
      });
    } else {
      res = await this.schemaRepository.loadOne(id);
    }
    if (res) {
      res.variant = parseEnum(SchemaVariant, res.variant);
    }
    return res;
  }

  @Authorized()
  @Query(returns => SchemaConnection)
  public async allSchemas(
    @Args() args: ConnectionArgs //
  ) {
    const connection = await new EntityConnection(args, {
      repository: this.schemaRepository,
      sortOptions: [{ sort: 'title', order: 'ASC' }],
    });
    return {
      ...connection,
      edges: (await connection.edges).map(edge => ({
        ...edge,
        node: { ...edge.node, variant: parseEnum(SchemaVariant, edge.node.variant) },
      })),
    };
  }

  @Authorized()
  @Mutation(returns => Schema)
  public async createSchema(
    @Arg('input', type => SchemaInput) input: SchemaInput & { fields: any }
  ): Promise<Schema> {
    input.variant = SchemaVariant[(input.variant as unknown) as string];
    const schema = this.schemaRepository.create(input);
    if (schema.variant === SchemaVariant.Default) {
      schema.groups = ['Main'];
    } else {
      schema.groups = [schema.name];
    }
    await this.schemaRepository.save(schema);
    if (input.fields) {
      await setSchemaFields(schema.id, input.fields);
    }
    pubSub.publish('REBUILD_EXTERNAL', schema);
    schema.variant = parseEnum(SchemaVariant, schema.variant);
    processWebhooks('schema.created', { schema });
    return schema;
  }

  @Authorized()
  @Mutation(returns => Schema)
  public async updateSchema(
    @Arg('id', type => ID) id: string,
    @Arg('input', type => SchemaInput) input: SchemaInput & { fields: any }
  ): Promise<Schema> {
    if (input.fields) {
      await setSchemaFields(id, input.fields);
    }
    const schema = await this.schemaRepository.findOneOrFail(id);
    input.variant = parseEnum(SchemaVariant, input.variant);
    await this.schemaRepository.merge(schema, input);
    schema.settings = defaultsDeep(input.settings, schema.settings);
    await this.schemaRepository.save(schema);
    schema.variant = parseEnum(SchemaVariant, schema.variant);
    pubSub.publish('REBUILD_EXTERNAL', schema);
    processWebhooks('schema.updated', { schema });
    return schema;
  }

  @Authorized()
  @Mutation(returns => Boolean)
  public async removeSchema(@Arg('id', type => ID) id: string): Promise<boolean> {
    const schema = await this.schemaRepository.findOneOrFail(id);
    await this.schemaRepository.remove(schema);
    pubSub.publish('REBUILD_EXTERNAL', schema);
    processWebhooks('schema.removed', { schema });
    return true;
  }

  @Authorized()
  @Query(returns => Boolean)
  public async schemaNameAvailable(
    @Arg('name', type => String) name: string,
    @Arg('variant', type => SchemaVariant, { nullable: true }) variant: number
  ) {
    const count = await this.schemaRepository.count({
      where: {
        ...(variant && { variant: parseEnum(SchemaVariant, variant) }),
        name: Raw(alias => `lower(${alias}) = lower('${name.replace(/[\W_]+/g, '')}')`),
      },
    });
    return count === 0;
  }

  @FieldResolver(returns => [SchemaFieldGroup], {
    description: 'Get Schema Fields',
    nullable: true,
  })
  public fields(@Root() schema: Schema): Promise<SchemaFieldGroup[]> {
    return getSchemaFields(schema.id);
  }

  @FieldResolver(returns => Number, { nullable: true })
  public documentCount(@Root() schema: Schema) {
    const qb = getRepository(Document).createQueryBuilder();

    const sq = qb
      .subQuery()
      .select('id')
      .from(Document, 'd')
      .andWhere('d.documentId = Document.documentId')
      .limit(1);

    qb.andWhere('Document.schemaId = :schemaId', { schemaId: schema.id });
    qb.andWhere(`id = ${sq.getQuery()}`);

    return qb.getCount();
  }
}
