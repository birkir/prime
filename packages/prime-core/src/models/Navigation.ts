import { Model, Column, Table, PrimaryKey, DataType } from 'sequelize-typescript';

@Table
export class Navigation extends Model<Navigation> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  id;

  @Column(DataType.UUID)
  parentNavigationId;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.UUID)
  contentTypeId: string;

  @Column(DataType.UUID)
  contentEntryId: string;

  @Column(DataType.BOOLEAN)
  showEntries: boolean;

  @Column(DataType.INTEGER)
  index: number;
}
