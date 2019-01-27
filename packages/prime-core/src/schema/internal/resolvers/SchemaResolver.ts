import { Context } from 'apollo-server-core';
import { GraphQLResolveInfo } from 'graphql';
import { Arg, Ctx, Info, Query, registerEnumType, Resolver } from 'type-graphql';
// import { Repository } from 'typeorm';
// import { InjectRepository } from 'typeorm-typedi-extensions';
import { Schema, SchemaVariant } from '../../../entities/Schema';

registerEnumType(SchemaVariant, {
  name: 'SchemaVariant',
});

@Resolver(of => Schema)
export class SchemaResolver {
  // @InjectRepository(Schema)
  // private readonly schemaRepository: Repository<Schema>;

  public Schema() {}
  public allSchemas() {}
  public createSchema() {}
  public updateSchema() {}
  public removeSchema() {}

  @Query(returns => Boolean)
  public isSchemaNameAvailable(
    @Arg('name', type => String) name: string,
    @Arg('variant', type => SchemaVariant) variant: string,
    @Ctx() context: Context,
    @Info() info: GraphQLResolveInfo
  ) {
    return false;
  }
}
