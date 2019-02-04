import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class DocumentVersion {
  @Field()
  public id: string;

  @Field({ nullable: true })
  public publishedAt: Date;

  @Field()
  public createdAt: Date;

  @Field()
  public updatedAt: Date;

  @Field()
  public userId: string;
}
