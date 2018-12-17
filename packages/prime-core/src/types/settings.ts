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
