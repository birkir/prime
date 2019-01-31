import { Arg, Args, FieldResolver, ID, Mutation, Query, Resolver, Root } from 'type-graphql';
import { Raw } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Schema, SchemaVariant } from '../../../entities/Schema';
import { ConnectionArgs, createConnectionType } from '../../../utils/createConnectionType';
import { pubSub } from '../index';
import { SchemaRepository } from '../repositories/SchemaRepository';
import { SchemaFieldGroup } from '../types/SchemaFieldGroup';
import { SchemaInput } from '../types/SchemaInput';
import { getSchemaFields } from '../utils/getSchemaFields';
import { setSchemaFields } from '../utils/setSchemaFields';

const SchemaConnection = createConnectionType(Schema);
const parseEnum = (Enum, value: number) => Enum[(value as unknown) as string];

@Resolver(of => Schema)
export class SchemaResolver {
  @InjectRepository(SchemaRepository)
  private readonly schemaRepository: SchemaRepository;

  @Query(returns => Schema, { nullable: true, description: 'Get Schema by ID' })
  public Schema(
    @Arg('id', type => ID, { nullable: true }) id: string,
    @Arg('name', { nullable: true }) name: string
  ) {
    if (name) {
      return this.schemaRepository.findOne({
        name: Raw(alias => `lower(${alias}) = lower('${name.replace(/[\W_]+/g, '')}')`),
      });
    }
    return this.schemaRepository.loadOne(id);
  }

  @Query(returns => SchemaConnection)
  public allSchemas(
    @Args() args: ConnectionArgs //
  ) {
    return new EntityConnection(args, {
      repository: this.schemaRepository,
      sortOptions: [{ sort: 'title', order: 'ASC' }],
    });
  }

  @Mutation(returns => Schema)
  public async createSchema(
    @Arg('input', type => SchemaInput) input: SchemaInput & { fields: any }
  ): Promise<Schema> {
    input.variant = SchemaVariant[(input.variant as unknown) as string];
    const schema = this.schemaRepository.create(input);
    await this.schemaRepository.save(schema);
    if (input.fields) {
      await setSchemaFields(schema.id, input.fields);
    }
    pubSub.publish('REBUILD_EXTERNAL', schema);
    return schema;
  }

  @Mutation(returns => Schema)
  public async updateSchema(
    @Arg('id') id: string,
    @Arg('input', type => SchemaInput) input: SchemaInput & { fields: any }
  ): Promise<Schema> {
    const schema = await this.schemaRepository.findOneOrFail(id);
    if (input.fields) {
      await setSchemaFields(schema.id, input.fields);
    }
    input.variant = parseEnum(SchemaVariant, input.variant);
    await this.schemaRepository.merge(schema, input);
    pubSub.publish('REBUILD_EXTERNAL', schema);
    return schema;
  }

  @Mutation(returns => Boolean)
  public async removeSchema(@Arg('id', type => ID) id: string): Promise<boolean> {
    const schema = await this.schemaRepository.findOneOrFail(id);
    await this.schemaRepository.remove(schema);
    pubSub.publish('REBUILD_EXTERNAL', schema);
    return true;
  }

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
}
