import bcrypt from 'bcrypt';
import {
  BeforeCreate,
  Column,
  DataType,
  Default,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({ timestamps: true })
export class User extends Model<User> {
  @BeforeCreate
  public static HASH_PASSWORD(instance: User) {
    instance.password = bcrypt.hashSync(instance.password, 10);
  }
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  public id;

  @Column
  public firstname: string;

  @Column
  public lastname: string;

  @Column
  public displayName: string;

  @Column
  public avatarUrl: string;

  @IsEmail
  @Unique
  @Column
  public email: string;

  @Column
  public password: string;

  @Column
  public lastLogin: Date;

  @Default(DataType.NOW)
  @Column
  public lastPasswordChange: Date;

  public updatePassword(password) {
    return this.update({
      password: bcrypt.hashSync(password, 10),
      lastPasswordChange: new Date(),
    });
  }

  public isPasswordMatch(password) {
    return bcrypt.compareSync(password, this.password);
  }
}
