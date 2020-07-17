import { User } from '@accounts/typeorm';
import debug from 'debug';
import Container, { Service } from 'typedi';
import { LessThan } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { DocumentRepository } from '../modules/internal/repositories/DocumentRepository';
import { ReleaseRepository } from '../modules/internal/repositories/ReleaseRepository';
import { UserRepository } from '../modules/internal/repositories/UserRepository';

const log = debug('prime:release:cron');

const ONE_MINUTE = 1000 * 60;

@Service()
export class ReleaseCron {
  /**
   * Run the cron every minute to check for releases
   */
  public static run() {
    if (!this.self) {
      this.self = Container.get(ReleaseCron);
    }

    this.self.tick();

    setTimeout(() => this.run(), ONE_MINUTE);
  }

  private static self: ReleaseCron;
  private user?: User;

  @InjectRepository()
  private readonly releaseRepository: ReleaseRepository;

  @InjectRepository()
  private readonly userRepository: UserRepository;

  @InjectRepository()
  private readonly documentRepository: DocumentRepository;

  /**
   * Gets the user that will be publishing the releases
   */
  private async getUser(): Promise<User | undefined> {
    // Get the first user for now
    this.user = await this.userRepository.findOne({
      order: { createdAt: 'ASC' },
    });

    return this.user;
  }

  private async tick() {
    log('checking for pending releases');

    // Get all the releases that are scheduled for the past and haven't yet been published
    const releases = await this.releaseRepository.find({
      relations: ['documents'],
      where: {
        scheduledAt: LessThan(new Date()),
        publishedAt: null,
      },
    });

    // Check that their is a valid user to use
    if (!this.user) {
      await this.getUser();
    }

    // If we have a user
    if (this.user) {
      // For every release
      for (const release of releases) {
        log(`releasing, ${release.name}`);

        // Publish the related documents
        const docs = release.documents.map(x => this.documentRepository.publish(x, this.user!.id));
        await Promise.all(docs);

        // Then update any documents with the release id to no longer contain the release id
        await this.documentRepository.update({ releaseId: release.id }, { releaseId: null as any });

        // Update the release to have a publishedAt date and publishedBy user
        release.publishedAt = new Date();
        release.publishedBy = this.user.id;

        // And then save the updated release
        await this.releaseRepository.save(release);
      }
    }
  }
}
