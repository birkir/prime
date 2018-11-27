import { startCase } from 'lodash';
import { BeforeCreate, Column, DataType, HasMany, Is, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { ContentEntry } from './ContentEntry';
import { ContentTypeField } from './ContentTypeField';

@Table
export class ContentType extends Model<ContentType> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public id;

  @Is('AlphaNumeric', (value) => {
    if (!/^[A-Za-z][A-Za-z0-9]+$/.test(value)) {
      throw new Error(`"${value}" is not in alphanumeric.`);
    }
  })
  @Unique
  @Column
  public name: string;

  @Column
  public title: string;

  @Column
  public isSlice: boolean;

  @HasMany(() => ContentEntry, {
    onUpdate: 'SET NULL',
    onDelete: 'SET NULL'
  })
  public contentEntry: ContentEntry;

  @HasMany(() => ContentTypeField)
  public fields: ContentTypeField[];

  @BeforeCreate
  public static async SET_NAME(instance: ContentType) {
    if (!instance.name && instance.title) {
      const baseName = startCase(instance.title).replace(/ /g, '');
      let name = baseName;
      let count = 1;
      let i = 1;
      while (count === 1) {
        count = await ContentType.count({ where: { name }});
        if (count === 1) {
          name = `${baseName}${i}`;
          i += 1;
        }
      }
      instance.name = name;
    }
  }
}
