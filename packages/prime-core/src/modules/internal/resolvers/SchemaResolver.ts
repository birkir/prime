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
import { Raw } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Schema, SchemaVariant } from '../../../entities/Schema';
import { ConnectionArgs, createConnectionType } from '../../../utils/createConnectionType';
import { SchemaRepository } from '../repositories/SchemaRepository';
import { SchemaFieldGroup } from '../types/SchemaFieldGroup';
import { SchemaInput } from '../types/SchemaInput';
import { getSchemaFields } from '../utils/getSchemaFields';
import { setSchemaFields } from '../utils/setSchemaFields';

const SchemaConnection = createConnectionType(Schema);
const parseEnum = (Enum, value: number) => Enum[(value as unknown) as string];

registerEnumType(SchemaVariant, {
  name: 'SchemaVariant',
});

@Resolver(of => Schema)
export class SchemaResolver {
  @InjectRepository(SchemaRepository)
  private readonly schemaRepository: SchemaRepository;

  @Query(returns => Schema, { nullable: true, description: 'Get Schema by ID' })
  public Schema(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context,
    @Info() info: GraphQLResolveInfo
  ) {
    return this.schemaRepository.loadOne(id);
  }

  @Query(returns => SchemaConnection)
  public allSchemas(@Args() args: ConnectionArgs) {
    return new EntityConnection(args, {
      repository: this.schemaRepository,
      sortOptions: [{ sort: 'title', order: 'ASC' }],
    });
  }

  @Mutation(returns => Schema)
  public async createSchema(
    @Arg('input', type => SchemaInput) input: SchemaInput & { fields: any },
    @Ctx() context: Context
  ): Promise<Schema> {
    input.variant = SchemaVariant[(input.variant as unknown) as string];
    const entity = this.schemaRepository.create(input);
    if (input.fields) {
      await setSchemaFields(entity.id, input.fields);
    }
    return entity;
  }

  @Mutation(returns => Schema)
  public async updateSchema(
    @Arg('id') id: string,
    @Arg('input', type => SchemaInput) input: SchemaInput & { fields: any },
    @Ctx() context: Context
  ): Promise<Schema> {
    const entity = await this.schemaRepository.findOneOrFail(id);
    input.variant = parseEnum(SchemaVariant, input.variant);
    return this.schemaRepository.merge(entity, input);
  }

  @Mutation(returns => Boolean)
  public async removeSchema(
    @Arg('id', type => ID) id: string,
    @Ctx() context: Context
  ): Promise<boolean> {
    const entity = await this.schemaRepository.findOneOrFail(id);
    return Boolean(this.schemaRepository.remove(entity));
  }

  @Query(returns => Boolean)
  public async isSchemaNameAvailable(
    @Arg('name', type => String) name: string,
    @Arg('variant', type => SchemaVariant, { nullable: true }) variant: number,
    @Ctx() context: Context,
    @Info() info: GraphQLResolveInfo
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
