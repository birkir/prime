import { User as AccountsUser } from '@accounts/typeorm';
import { Column } from 'typeorm';

export class User extends AccountsUser {
  @Column({ nullable: true })
  public firstname: string;

  @Column({ nullable: true })
  public lastname: string;

  @Column({ nullable: true })
  public displayName: string;

  @Column({ nullable: true })
  public avatarUrl: string;
}
