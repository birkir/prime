import { User } from '@accounts/typeorm';
import GraphQLJSON from 'graphql-type-json';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Release } from './Release';
import { Schema } from './Schema';

@Entity()
@ObjectType()
export class Document {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ length: 10 })
  @Field(type => ID)
  public documentId: string;

  @Column({ default: 'en' })
  @Field()
  public locale: string;

  @Column('jsonb')
  @Field(type => GraphQLJSON)
  public data: any;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public publishedAt: Date;

  @CreateDateColumn()
  @Field({ nullable: true })
  public createdAt: Date;

  @UpdateDateColumn()
  @Field({ nullable: true })
  public updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  public deletedAt: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public schemaId: string;

  @ManyToOne(type => Schema, schema => schema.documents, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  public schema = Schema;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public releaseId?: string;

  @ManyToOne(type => Release, release => release.documents, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  public release = Release;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public userId?: string;

  @ManyToOne(type => User, { nullable: true, onDelete: 'SET NULL' })
  public user: User;
}
