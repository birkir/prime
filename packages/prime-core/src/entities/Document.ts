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
import GraphQLJSON from 'graphql-type-json';
import { Release } from './Release';
import { Schema } from './Schema';

@Entity()
@ObjectType()
export class Document {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  public id: string; // was: versionId

  @Column({ length: 10 })
  @Field(type => ID)
  public documentId: string; // was entryId

  @Column({ default: 'en' })
  @Field()
  public locale: string; // was: language

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

  @Column()
  public schemaId: string;

  @ManyToOne(type => Schema, schema => schema.documents)
  public schema = Schema;

  @Column({ nullable: true })
  public releaseId?: string;

  @ManyToOne(type => Release, release => release.documents, {
    cascade: 'remove' as any,
    onDelete: 'SET NULL',
    nullable: true,
  })
  public release = Release;

  @Column({ nullable: true })
  public userId?: string;

  @ManyToOne(type => User, { nullable: true })
  public user: User;
}
