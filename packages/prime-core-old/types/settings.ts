import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';

interface ISettingsPreview {
  name: string;
  hostname: string;
  pathname: string;
}

interface ISettingsLocale {
  id: string;
  name: string;
  flag: string;
  master: boolean;
}

export interface ISettings {
  accessType: 'public' | 'private';
  previews: ISettingsPreview[];
  locales: ISettingsLocale[];
  masterLocale: ISettingsLocale;
}

const SettingsAccessType = new GraphQLEnumType({
  name: 'SettingsAccessType',
  values: {
    public: { value: 'public' },
    private: { value: 'private' },
  },
});

const SettingsPreviewInput = new GraphQLInputObjectType({
  name: 'SettingsPreviewInput',
  fields: {
    name: { type: GraphQLString },
    hostname: { type: GraphQLString },
    pathname: { type: GraphQLString },
  },
});

const SettingsLocaleInput = new GraphQLInputObjectType({
  name: 'SettingsLocaleInput',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    flag: { type: GraphQLString },
    master: { type: GraphQLBoolean },
  },
});

export const GraphQLSettingsInput = new GraphQLInputObjectType({
  name: 'SettingsInput',
  fields: {
    accessType: { type: SettingsAccessType },
    previews: { type: new GraphQLList(SettingsPreviewInput) },
    locales: { type: new GraphQLList(SettingsLocaleInput) },
  },
});
