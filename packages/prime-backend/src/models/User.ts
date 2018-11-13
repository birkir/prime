import { Model, Column, Table, PrimaryKey, DataType, IsEmail } from 'sequelize-typescript';

@Table
export class User extends Model<User> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  id;

  @Column
  firstname: string;

  @Column
  lastname: string;

  @IsEmail
  @Column
  email: string;

  @Column
  password: string;

  @Column
  lastLogin: Date;
}
