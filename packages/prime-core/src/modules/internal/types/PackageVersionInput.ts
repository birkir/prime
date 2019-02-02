import { Field, InputType } from 'type-graphql';

@InputType()
export class PackageVersionInput {
  @Field()
  public name: string;

  @Field()
  public version: string;
}
