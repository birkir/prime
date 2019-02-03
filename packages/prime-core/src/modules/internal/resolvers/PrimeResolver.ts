import { defaults } from 'lodash';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Repository } from 'typeorm';
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

  @Mutation(returns => SettingsType)
  public async setSettings(@Arg('input', type => SettingsType) input: SettingsType) {
    const data = await this.getSettings();
    const settings = this.settingsRepository.create({
      data: defaults(input, data),
    });
    await this.settingsRepository.save(settings);
    return this.getSettings();
  }

  @Query(returns => [PrimeField])
  public allFields(): PrimeField[] {
    return fields;
  }

  @Query(returns => [PackageVersion], { nullable: true })
  public system() {
    return getPackagesVersion();
  }

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
