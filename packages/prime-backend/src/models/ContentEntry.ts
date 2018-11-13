import { Model, Column, Table, Scopes, BelongsTo, PrimaryKey, ForeignKey, DataType } from 'sequelize-typescript';
import { ContentType } from './ContentType';

@Scopes({
  contentType: {
    include: [{
      model: () => ContentType,
      through: { attributes: [] },
    }],
  },
})
@Table({
  timestamps: true,
})
export class ContentEntry extends Model<ContentEntry> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  id;

  @Column(DataType.UUID)
  @ForeignKey(() => ContentType)
  contentTypeId;

  @Column
  language: string;

  @Column(DataType.JSON)
  data;

  @BelongsTo(() => ContentType)
  contentType: ContentType;
}
