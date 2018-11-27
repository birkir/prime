import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ timestamps: true })
export class ContentRelease extends Model<ContentRelease> {

  @PrimaryKey
  @Column({
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4
  })
  public id;

  @Column
  public name: string;

  @Column
  public publishAt: Date;
}
