import { JSON } from 'sequelize';
import { BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { fields } from '../fields';
import { ContentType } from './ContentType';

@Table
export class ContentTypeField extends Model<ContentTypeField> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  public id: string;

  @Column
  public name: string;

  @Column
  public title: string;

  @Column
  public description: string;

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
    onUpdate: 'SET NULL',
  })
  public contentType: ContentType;

  @Column(JSON)
  public options;

  public get field() {
    return fields.find(f => f.id === this.type);
  }

  public prefix = '';

  public get apiName() {
    const { name, prefix = '' } = this;

    return `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  }
}
