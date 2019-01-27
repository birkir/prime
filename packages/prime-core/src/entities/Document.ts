import { User } from '@accounts/typeorm';
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
import { getUniqueHashId } from '../utils/getUniqueHashId';
import { Release } from './Release';
import { Schema } from './Schema';

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  public id: string; // was: versionId

  @Column({ length: 10 })
  public documentId: string;

  @Column({ default: 'en' })
  public locale: string; // was: language

  @Column('jsonb')
  public data: any;

  @Column({ nullable: true })
  public publishedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  public deletedAt: Date;

  @ManyToOne(type => Schema, schema => schema.documents)
  public schema = Schema;

  @ManyToOne(type => Release, release => release.documents, { cascade: true, onDelete: 'SET NULL' })
  public release = Release;

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
