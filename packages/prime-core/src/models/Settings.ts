import { Column, DataType, Model, Table, PrimaryKey, Default, UpdatedAt, CreatedAt, BelongsTo } from 'sequelize-typescript';
import { defaultsDeep } from 'lodash';
import { User } from './User';
import { ISettings } from '../types/settings';

@Table
export class Settings extends Model<Settings> {

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

  static async get(): Promise<ISettings> {
    const res = await Settings.findOne({
      order: [['updatedAt', 'DESC']]
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

    const masterLocale = [].concat(settings.locales)
      .find((locale: any) => locale && locale.master);

    if (!masterLocale) {
      settings.locales.push(defaultLocale);
    }

    settings.masterLocale = [].concat(settings.locales)
      .find((locale: any) => locale && locale.master);

    return settings;
  }
}
