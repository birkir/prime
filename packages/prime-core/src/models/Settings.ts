import { Column, DataType, Model, Table, PrimaryKey, Default, UpdatedAt, CreatedAt, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table
export class Settings extends Model<Settings> {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public id: any;

  @Column(DataType.JSONB)
  public data: any;

  @Column(DataType.UUID)
  public userId;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

  @BelongsTo(() => User, 'userId')
  public user: User;
}
