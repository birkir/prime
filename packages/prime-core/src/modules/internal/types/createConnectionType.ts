import { ArgsType, Field, Int, ObjectType } from 'type-graphql';
import { ObjectType as EntityType } from 'typeorm';
import { PageInfo } from '../types/PageInfo';

@ArgsType()
export class ConnectionArgs {
  @Field(type => Int, { nullable: true })
  public first?: number;

  @Field(type => Int, { nullable: true })
  public last?: number;

  @Field(type => Int, { nullable: true })
  public skip?: number;

  @Field({ nullable: true })
  public after?: string;

  @Field({ nullable: true })
  public before?: string;
}

export const createConnectionType = <T>(model: EntityType<T>) => {
  // tslint:disable-next-line max-classes-per-file
  @ObjectType(`${model.name}ConnectionEdge`)
  class ConnectionEdge {
    @Field(type => model)
    public node: T;

    @Field()
    public cursor: string;
  }

  // tslint:disable-next-line max-classes-per-file
  @ObjectType(`${model.name}Connection`)
  class Connection {
    public static args = ConnectionArgs;

    @Field(type => [ConnectionEdge])
    public edges: ConnectionEdge;

    @Field(type => PageInfo)
    public pageInfo: PageInfo;

    @Field({ nullable: true })
    public totalCount: number;
  }

  return Connection as any;
};
