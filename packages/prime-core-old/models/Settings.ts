import { defaultsDeep } from 'lodash';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ISettings } from '../types/settings';
import { User } from './User';

@Table
export class Settings extends Model<Settings> {
  public static async get(): Promise<ISettings> {
    const res = await Settings.findOne({
      order: [['updatedAt', 'DESC']],
    });

    const defaults = {
      accessType: 'public',
      previews: [],
      locales: [],
    };

    const settings = defaultsDeep((res && res.data) || {}, defaults);

    const defaultLocale = {
      id: 'en',
      name: 'English (US)',
      flag: 'us',
      master: true,
    };

    const masterLocale = [].concat(settings.locales).find((locale: any) => locale && locale.master);

    if (!masterLocale) {
      settings.locales.push(defaultLocale);
    }

    settings.masterLocale = []
      .concat(settings.locales)
      .find((locale: any) => locale && locale.master);

    return settings;
  }
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id: any;

  @Column(DataType.JSONB)
  public data: any;

  @Column(DataType.UUID)
  public userId;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

  @BelongsTo(() => User, 'userId')
  public user: User;
}
