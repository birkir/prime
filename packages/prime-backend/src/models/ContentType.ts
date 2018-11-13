import { Model, Column, Table, HasMany, PrimaryKey, DataType, Unique } from 'sequelize-typescript';
import { ContentEntry } from './ContentEntry';
import { ContentTypeField } from './ContentTypeField';

@Table
export class ContentType extends Model<ContentType> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  id;

  @Unique
  @Column
  name: string;

  @HasMany(() => ContentEntry)
  contentEntry: ContentEntry;

  @HasMany(() => ContentTypeField)
  fields: ContentTypeField[];
}
