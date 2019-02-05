import { AccountsModule } from '@accounts/graphql-api';
import AccountsPassword from '@accounts/password';
import AccountsTypeorm, { User, UserEmail } from '@accounts/typeorm';
import GraphQLJSON from 'graphql-type-json';
import { defaults } from 'lodash';
import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Settings } from '../../../entities/Settings';
import { fields } from '../../../utils/fields';
import { PackageVersion } from '../types/PackageVersion';
import { PackageVersionInput } from '../types/PackageVersionInput';
import { PrimeField } from '../types/PrimeField';
import { Settings as SettingsType, SettingsAccessType } from '../types/Settings';
import { getPackagesVersion } from '../utils/getPackagesVersion';
import { updateNpmPackages } from '../utils/updateNpmPackages';

@Resolver()
export class PrimeResolver {
  @InjectRepository(Settings)
  private readonly settingsRepository: Repository<Settings>;

  @Query(returns => Boolean)
  public async isOnboarding() {
    const count = await getRepository(User).count();
    return count === 0;
  }

  @Mutation(returns => Boolean)
  public async onboard(
    @Arg('email') email: string,
    @Arg('profile', type => GraphQLJSON) profile: any
  ) {
    const count = await getRepository(User).count();
    if (count === 1) {
      const { userId } = await getRepository(UserEmail).findOneOrFail({ address: email });
      const password = AccountsModule.injector.get(AccountsPassword);
      const db = password.server.options.db as AccountsTypeorm;
      await password.server.activateUser(userId);
      await password.server.setProfile(userId, profile);
      await db.verifyEmail(userId, email);
      return true;
    }

    return false;
  }

  @Authorized()
  @Query(returns => SettingsType)
  public async getSettings() {
    let settings = await this.settingsRepository.findOne({
      order: { updatedAt: 'DESC' },
    });

    if (!settings) {
      settings = new Settings();
      settings.data = {
        accessType: SettingsAccessType.PUBLIC,
        previews: [],
        locales: [],
      };
    }

    settings.ensureMasterLocale();

    return settings.data;
  }

  @Authorized()
  @Mutation(returns => SettingsType)
  public async setSettings(@Arg('input', type => SettingsType) input: SettingsType) {
    const data = await this.getSettings();
    const settings = this.settingsRepository.create({
      data: defaults(input, data),
    });
    await this.settingsRepository.save(settings);
    return this.getSettings();
  }

  @Authorized()
  @Query(returns => [PrimeField])
  public allFields(): PrimeField[] {
    return fields;
  }

  @Authorized()
  @Query(returns => [PackageVersion], { nullable: true })
  public system() {
    return getPackagesVersion();
  }

  @Authorized()
  @Mutation(returns => Boolean)
  public async updateSystem(
    @Arg('versions', type => [PackageVersionInput]) packagesVersion: PackageVersionInput[]
  ): Promise<boolean> {
    const allowedPackages = [
      '@primecms/core',
      '@primecms/ui',
      ...fields.map(({ packageName }) => ({ packageName })),
    ];

    if (process.env.NODE_ENV !== 'production') {
      throw new Error('Cannot update packages without NODE_ENV=production');
    }

    const updateQueue = packagesVersion
      .filter(pkg => allowedPackages.includes(pkg.name))
      .map(pkg => `${pkg.name}@${pkg.version}`);

    await updateNpmPackages(updateQueue);

    return true;
  }
}
