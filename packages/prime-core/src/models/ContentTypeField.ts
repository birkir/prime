import { JSON } from 'sequelize';
import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table, Default } from 'sequelize-typescript';
import { ContentType } from './ContentType';

@Table
export class ContentTypeField extends Model<ContentTypeField> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public id: string;

  @Column
  public name: string;

  @Column
  public title: string;

  @Column
  public type: string;

  @Default('Main')
  @Column
  public group: string;

  @Default(0)
  @Column
  public position: number;

  @Default(false)
  @Column
  public isDisplay: boolean;

  @ForeignKey(() => ContentType)
  @Column(DataType.UUID)
  public contentTypeId;

  @ForeignKey(() => ContentTypeField)
  @Column(DataType.UUID)
  public contentTypeFieldId;

  @BelongsTo(() => ContentType, {
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL'
  })
  public contentType: ContentType;

  @Column(JSON)
  public options;

  // @BeforeCreate
  // public static async ensureName() {
  //   // name must be unique to contentTypeId OR contentTypeFieldId
  // }
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
