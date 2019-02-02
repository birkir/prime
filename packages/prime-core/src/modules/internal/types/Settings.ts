import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { SettingsLocale } from './SettingsLocale';
import { SettingsPreview } from './SettingsPreview';

export enum SettingsAccessType {
  PUBLIC,
  PRIVATE,
}

registerEnumType(SettingsAccessType, {
  name: 'SettingsAccessType',
});

@InputType('SettingsInput')
@ObjectType('Settings')
export class Settings {
  @Field(type => SettingsAccessType, { nullable: true })
  public accessType: SettingsAccessType;

  @Field(type => [SettingsPreview], { nullable: true })
  public previews: SettingsPreview[];

  @Field(type => [SettingsLocale], { nullable: true })
  public locales: SettingsLocale[];
}
