import { Model, Column, Table, PrimaryKey, DataType } from 'sequelize-typescript';

@Table({ timestamps: true })
export class ContentRelease extends Model<ContentRelease> {

  @PrimaryKey
  @Column({
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
  })
  id;

  @Column
  name: string;

  @Column
  publishAt: Date;
}
