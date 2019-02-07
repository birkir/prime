import { User } from '@accounts/typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class AccessToken {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  public id: string;

  @Column()
  @Field()
  public name: string;

  @Column()
  @Field()
  public token: string;

  @CreateDateColumn()
  @Field(type => Date)
  public createdAt: Date;

  @UpdateDateColumn()
  @Field(type => Date)
  public updatedAt: Date;

  @Column()
  @Field()
  public userId: string;

  @ManyToOne(type => User)
  public user: User;
}
