import { Model, Column, Table, BelongsTo, ForeignKey, PrimaryKey, DataType } from 'sequelize-typescript';
import { ContentType } from './ContentType';
import { JSON } from 'sequelize';

@Table
export class ContentTypeField extends Model<ContentTypeField> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  id: string;

  @Column
  name: string;

  @Column
  title: string;

  @Column
  type: string;

  @Column
  group: string;

  @ForeignKey(() => ContentType)
  @Column(DataType.UUID)
  contentTypeId;

  @BelongsTo(() => ContentType, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  contentType: ContentType;

  @Column(JSON)
  options;
}

// UID: String
// Title: { restrict: [h1,h2,h3,h4,h5,h6] }
// RichText: String
// Image
// Document
// Documents
// Link: String
// Date: Date
// Timestamp: Date
// Color: String
// Number: Number
// Select - { values: ['a', 'b'], default: 'none', placeholder: 'none' }
// GeoPoint: [number, number];
// Embed: String
// Group: ContentTypeField[]
