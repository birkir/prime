import { Column, DataType, Model, PrimaryKey, Table, Default } from 'sequelize-typescript';

@Table({ timestamps: true })
export class ContentRelease extends Model<ContentRelease> {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id: any;

  @Column
  public name: string;

  @Column
  public description: string;

  @Column
  public scheduledAt: Date;

  @Column
  public publishedAt: Date;

  @Column(DataType.UUID)
  public publishedBy: any;
}
