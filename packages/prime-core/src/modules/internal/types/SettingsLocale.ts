import { GraphQLID } from 'graphql';
import { Field, InputType, ObjectType } from 'type-graphql';

@InputType('LocaleInput')
@ObjectType('Locale')
export class SettingsLocale {
  @Field(type => GraphQLID)
  public id: string;

  @Field()
  public name: string;

  @Field({ nullable: true })
  public flag: string;

  @Field({ nullable: true })
  public master: boolean;
}
