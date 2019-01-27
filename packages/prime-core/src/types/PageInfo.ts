import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class PageInfo {
  @Field()
  public hasNextPage: boolean;

  @Field()
  public hasPreviousPage: boolean;

  @Field()
  public startCursor: string;

  @Field()
  public endCursor: string;
}
