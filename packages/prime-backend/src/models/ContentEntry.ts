import { Model, Column, Table, Scopes, BelongsTo, PrimaryKey, ForeignKey, DataType, BeforeCreate } from 'sequelize-typescript';
import { ContentType } from './ContentType';
import { ContentRelease } from './ContentRelease';
import Hashids from 'hashids';

const hashids = new Hashids('SaltingTheHash', 10);

@Scopes({
  contentType: {
    include: [{
      model: () => ContentType,
      through: { attributes: [] },
    }],
  },
  contentRelease: {
    include: [{
      model: () => ContentRelease,
      through: { attributes: [] },
    }]
  }
})
@Table({
  timestamps: true,
})
export class ContentEntry extends Model<ContentEntry> {

  @Column(DataType.STRING)
  entryId: string;

  @PrimaryKey
  @Column({
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
  })
  versionId;

  @Column(DataType.UUID)
  @ForeignKey(() => ContentType)
  contentTypeId;

  @BelongsTo(() => ContentType, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  contentType: ContentType;

  @Column(DataType.UUID)
  @ForeignKey(() => ContentRelease)
  contentReleaseId;

  @BelongsTo(() => ContentRelease)
  contentRelease: ContentRelease;

  @Column({
    type: DataType.STRING,
    defaultValue: 'en',
  })
  language: string;

  @Column(DataType.BOOLEAN)
  isPublished: boolean;

  @Column(DataType.JSON)
  data;

  @BeforeCreate
  static async setEntryId(instance: ContentEntry) {
    instance.entryId = await ContentEntry.getRandomId();
  }

  static async getRandomId() {
    const entryId = hashids.encode(+new Date());
    const count = await ContentEntry.count({
      where: {
        entryId,
      }
    });
    return count === 0 ? entryId : await ContentEntry.getRandomId();
  }

  // Update with version
  draft(data, language) {
    const res = {
      entryId: this.entryId,
      contentTypeId: this.contentTypeId,
      contentReleaseId: this.contentReleaseId,
      language: language || this.language,
      isPublished: false,
      data,
    };

    return ContentEntry.create(res);
  }

  publish() {
    const res = {
      entryId: this.entryId,
      contentTypeId: this.contentTypeId,
      contentReleaseId: this.contentReleaseId,
      language: this.language,
      isPublished: true,
      data: this.data,
    };

    return ContentEntry.create(res);
  }
}
