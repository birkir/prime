import hashids from 'hashids';
import { BeforeCreate, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table, Default, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { ContentRelease } from './ContentRelease';
import { ContentType } from './ContentType';
import { User } from './User';

const hashid = new hashids('SaltingTheHash', 10);

@Table
export class ContentEntry extends Model<ContentEntry> {

  @Column(DataType.STRING)
  public entryId: string;

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public versionId: any;

  @ForeignKey(() => ContentType)
  @Column(DataType.UUID)
  public contentTypeId: any;

  @ForeignKey(() => ContentRelease)
  @Column(DataType.UUID)
  public contentReleaseId: any;

  @Default('en')
  @Column
  public language: string;

  @Column
  public isPublished: boolean;

  @Column(DataType.JSON)
  public data: any;

  @Column(DataType.UUID)
  public userId: any;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

  @DeletedAt
  @Column
  public deletedAt: Date;


  // --- Accessors

  @BelongsTo(() => ContentType, {
    foreignKey: 'contentTypeId',
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL'
  })
  public contentType: ContentType;

  @BelongsTo(() => ContentRelease, {
    foreignKey: 'contentReleaseId',
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL'
  })
  public contentRelease: ContentRelease;

  @BelongsTo(() => User, 'userId')
  public user: User;


  // --- Model methods

  public draft(data, language, contentReleaseId?: string, userId?: string) {
    const res = {
      entryId: this.entryId,
      contentTypeId: this.contentTypeId,
      contentReleaseId: contentReleaseId || this.contentReleaseId,
      language: language || this.language,
      isPublished: false,
      data: data || this.data,
      userId,
    };

    // Calculate flag if we want to keep a revision history
    const isNewDraft = this.isPublished
      || language !== this.language
      || contentReleaseId !== this.contentReleaseId
      || userId !== this.userId;
      // || this.updatedAt > new Date(+new Date() - 3600 * 1000)

    if (!isNewDraft) {
      return this.update({
        language,
        data,
        userId
      });
    }

    return ContentEntry.create(res);
  }

  public publish(userId?: string) {
    const res = {
      entryId: this.entryId,
      contentTypeId: this.contentTypeId,
      contentReleaseId: null,
      language: this.language,
      isPublished: true,
      data: this.data,
      userId,
    };

    return ContentEntry.create(res);
  }

  // --- Static methods

  @BeforeCreate
  public static async SET_ENTRY_ID(instance: ContentEntry) {
    if (!instance.entryId) {
      instance.entryId = await ContentEntry.GET_RANDOM_ID();
    }
  }

  public static async GET_RANDOM_ID() {
    const entryId = hashid.encode(+new Date());
    const count = await ContentEntry.count({
      where: {
        entryId
      }
    });

    return count === 0 ? entryId : ContentEntry.GET_RANDOM_ID();
  }
}
