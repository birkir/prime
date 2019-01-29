import { User } from '@accounts/typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GraphQLJSON } from '../types/GraphQLJSON';
import { getUniqueHashId } from '../utils/getUniqueHashId';
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

  @ManyToOne(type => Release, release => release.documents, { cascade: true, onDelete: 'SET NULL' })
  public release = Release;

  @Column()
  public userId: string;

  @ManyToOne(type => User)
  public user: User;

  @BeforeInsert()
  public async ensureDocumentId() {
    const repository = getRepository(Document);
    if (!this.documentId) {
      this.documentId = await getUniqueHashId(repository, 'documentId');
    }
  }
}
