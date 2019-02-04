import { User } from '@accounts/typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Settings as SettingsType } from '../modules/internal/types/Settings';

interface Locale {
  id: string;
  name: string;
  flag: string;
  master: boolean;
}

@Entity()
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'jsonb', default: {} })
  public data?: SettingsType;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @Column({ nullable: true })
  public userId: string;

  @ManyToOne(type => User, { nullable: true })
  public user: User;

  public ensureMasterLocale() {
    const locales = (this.data && this.data.locales) || [];

    const defaultLocale = {
      id: 'en',
      name: 'English (US)',
      flag: 'us',
      master: true,
    };

    if (locales.length > 0) {
      const master = locales.find(locale => locale.master === true);
      if (!master) {
        locales[0].master = true;
      }
    } else {
      locales.push(defaultLocale);
    }

    return locales.find((locale: Locale) => locale && locale.master);
  }
}
