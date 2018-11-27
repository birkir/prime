import * as bcrypt from 'bcrypt';
import { BeforeCreate, Column, DataType, IsEmail, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

@Table({ timestamps: true })
export class User extends Model<User> {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public id;

  @Column
  public firstname: string;

  @Column
  public lastname: string;

  @IsEmail
  @Unique
  @Column
  public email: string;

  @Column
  public password: string;

  @Column
  public lastLogin: Date;

  @BeforeCreate
  public static HASH_PASSWORD(instance: User) {
    instance.password = bcrypt.hashSync(instance.password, 10);
  }

  public isPasswordMatch(password) {
    return bcrypt.compareSync(password, this.password);
  }
}
