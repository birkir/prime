import { Model, Column, Table, HasMany, PrimaryKey, DataType, Unique, Is, BeforeCreate } from 'sequelize-typescript';
import { ContentEntry } from './ContentEntry';
import { ContentTypeField } from './ContentTypeField';
import { startCase } from 'lodash';

@Table
export class ContentType extends Model<ContentType> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  id;

  // @Default('Aa')
  @Is('PascalNumericCase', (value) => {
    if (!/^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*$/.test(value)) {
      throw new Error(`"${value}" is not in PascalNumericCase.`);
    }
  })
  @Unique
  @Column
  name: string;

  @Column
  title: string;

  @HasMany(() => ContentEntry, {
    onUpdate: 'SET NULL',
    onDelete: 'SET NULL',
  })
  contentEntry: ContentEntry;

  @HasMany(() => ContentTypeField)
  fields: ContentTypeField[];

  @BeforeCreate
  static async setName(instance: ContentType) {
    if (!instance.name && instance.title) {
      const baseName = startCase(instance.title).replace(/ /g, '');
      let name = baseName;
      let count = 1;
      let i = 1;
      while (count === 1) {
        count = await ContentType.count({ where: { name }});
        if (count === 1) {
          name = `${baseName}${i++}`;
        }
      }
      instance.name = name;
    }
  }
}
