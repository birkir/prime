import hashids from 'hashids';
import { BeforeCreate, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Scopes, Table } from 'sequelize-typescript';
import { ContentRelease } from './ContentRelease';
import { ContentType } from './ContentType';

const hashid = new hashids('SaltingTheHash', 10);

@Scopes({
  contentType: {
    include: [{
      model: () => ContentType,
      through: { attributes: [] }
    }]
  },
  contentRelease: {
    include: [{
      model: () => ContentRelease,
      through: { attributes: [] }
    }]
  }
})
@Table({
  timestamps: true
})
export class ContentEntry extends Model<ContentEntry> {

  @Column(DataType.STRING)
  public entryId: string;

  @PrimaryKey
  @Column({
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4
  })
  public versionId;

  @Column(DataType.UUID)
  @ForeignKey(() => ContentType)
  public contentTypeId;

  @BelongsTo(() => ContentType, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL'
  })
  public contentType: ContentType;

  @Column(DataType.UUID)
  @ForeignKey(() => ContentRelease)
  public contentReleaseId;

  @BelongsTo(() => ContentRelease)
  public contentRelease: ContentRelease;

  @Column({
    type: DataType.STRING,
    defaultValue: 'en'
  })
  public language: string;

  @Column(DataType.BOOLEAN)
  public isPublished: boolean;

  @Column(DataType.JSON)
  public data;

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

  // Update with version
  public draft(data, language) {
    const res = {
      entryId: this.entryId,
      contentTypeId: this.contentTypeId,
      contentReleaseId: this.contentReleaseId,
      language: language || this.language,
      isPublished: false,
      data
    };

    if (!this.isPublished && (language === this.language)) {
      // And later check if its the same user account
      return this.update({
        language,
        data
      });
    }

    return ContentEntry.create(res);
  }

  public publish() {
    const res = {
      entryId: this.entryId,
      contentTypeId: this.contentTypeId,
      contentReleaseId: this.contentReleaseId,
      language: this.language,
      isPublished: true,
      data: this.data
    };

    return ContentEntry.create(res);
  }
}
