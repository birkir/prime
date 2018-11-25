import { Model, Column, Table, PrimaryKey, DataType, IsEmail, Unique, BeforeCreate } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

@Table({ timestamps: true })
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
  @Unique
  @Column
  email: string;

  @Column
  password: string;

  @Column
  lastLogin: Date;

  @BeforeCreate
  static hashPassword(instance: User) {
    instance.password = bcrypt.hashSync(instance.password, 10);
  }

  isPasswordMatch(password) {
    return bcrypt.compareSync(password, this.password);
  }
}
