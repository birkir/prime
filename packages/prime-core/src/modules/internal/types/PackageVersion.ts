import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class PackageVersion {
  @Field()
  public name: string;

  @Field({ nullable: true })
  public currentVersion?: string;

  @Field({ nullable: true })
  public latestVersion?: string;
}
