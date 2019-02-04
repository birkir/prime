import { Field, InputType, ObjectType } from 'type-graphql';

@InputType('PreviewInput')
@ObjectType('Preview')
export class SettingsPreview {
  @Field()
  public name: string;

  @Field()
  public hostname: string;

  @Field({ nullable: true })
  public pathname: string;
}
