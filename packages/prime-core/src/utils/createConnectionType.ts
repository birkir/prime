import { ArgsType, Field, Int, ObjectType } from 'type-graphql';
import { ObjectType as EntityType } from 'typeorm';
import { PageInfo } from '../types/PageInfo';

// tslint:disable-next-line
@ArgsType()
export class ConnectionArgs {
  @Field(type => Int, { nullable: true })
  public first?: number;

  @Field(type => Int, { nullable: true })
  public last?: number;

  @Field({ nullable: true })
  public after?: string;

  @Field({ nullable: true })
  public before?: string;
}

export const createConnectionType = <Entity>(model: EntityType<Entity>) => {
  // tslint:disable-next-line
  @ObjectType({ description: 'foo' })
  class ConnectionNode {
    @Field(type => model)
    public node: Entity;

    @Field()
    public cursor: string;
  }

  // tslint:disable-next-line
  @ObjectType({ description: 'bleh' })
  class Connection {
    public static args = ConnectionArgs;

    @Field(type => [ConnectionNode])
    public edges: ConnectionNode;

    @Field(type => PageInfo)
    public pageInfo: PageInfo;
  }

  return Connection;
};
