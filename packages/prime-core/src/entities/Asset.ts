import { User } from '@accounts/typeorm';
import { GraphQLFloat } from 'graphql';
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
export class Asset {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  @Field({ nullable: true })
  public createdAt: Date;

  @UpdateDateColumn()
  @Field({ nullable: true })
  public updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  public deletedAt: Date;

  @Column({ nullable: false })
  @Field({ nullable: false })
  public url: string;

  @Column({ nullable: false })
  @Field({ nullable: false })
  public mimeType: string;

  @Column({ nullable: false })
  @Field({ nullable: false })
  public handle: string;

  @Column({ nullable: false })
  @Field({ nullable: false })
  public fileName: string;

  @Column({ nullable: false })
  @Field({ nullable: false })
  public fileSize: number;

  @Column('float', { nullable: true })
  @Field(type => GraphQLFloat, { nullable: true })
  public width: number;

  @Column('float', { nullable: true })
  @Field(type => GraphQLFloat, { nullable: true })
  public height: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public userId?: string;

  @ManyToOne(type => User, { nullable: true, onDelete: 'SET NULL' })
  public user: User;
}
