import { startCase } from 'lodash';
import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  Is,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { ContentEntry } from './ContentEntry';
import { ContentTypeField } from './ContentTypeField';
import { User } from './User';

@Table({
  timestamps: true,
})
export class ContentType extends Model<ContentType> {
  @BeforeCreate
  public static async SET_NAME(instance: ContentType) {
    if (!instance.name && instance.title) {
      const { title, isSlice, isTemplate } = instance;
      const baseName = startCase(title).replace(/ /g, '');
      let name = baseName;
      let count = 1;
      let i = 1;
      while (count === 1) {
        count = await ContentType.count({ where: { name, isSlice, isTemplate } });
        if (count === 1) {
          name = `${baseName}${i}`;
          i += 1;
        }
      }
      instance.name = name;
    }
  }
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  public id: any;

  @Is('AlphaNumeric', value => {
    if (!/^[A-Za-z][A-Za-z0-9]+$/.test(value)) {
      throw new Error(`"${value}" is not in alphanumeric.`);
    }
  })
  @Unique
  @Column
  public name: string;

  @Column
  public title: string;

  @Default(false)
  @Column
  public isSlice: boolean;

  @Default(false)
  @Column
  public isTemplate: boolean;

  @Column(DataType.JSONB)
  public groups: any;

  @Column(DataType.JSONB)
  public settings: any;

  @Column(DataType.UUID)
  public userId: any;

  @HasMany(() => ContentEntry, {
    onUpdate: 'SET NULL',
    onDelete: 'SET NULL',
  })
  public contentEntries: ContentEntry;

  @HasMany(() => ContentTypeField)
  public fields: ContentTypeField[];

  @BelongsTo(() => User, 'userId')
  public user: User;
}
