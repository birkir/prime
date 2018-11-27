import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export class Navigation extends Model<Navigation> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public id;

  @Column(DataType.UUID)
  public parentNavigationId;

  @Column(DataType.STRING)
  public name: string;

  @Column(DataType.UUID)
  public contentTypeId: string;

  @Column(DataType.UUID)
  public contentEntryId: string;

  @Column(DataType.BOOLEAN)
  public showEntries: boolean;

  @Column(DataType.INTEGER)
  public index: number;
}
