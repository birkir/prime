import { User } from '@accounts/typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Document } from './Document';

@Entity()
@ObjectType()
export class Release {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  public id: any;

  @Column()
  @Field()
  public name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public description: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  public scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  public publishedAt: Date;

  @Column('uuid', { nullable: true })
  @Field({ nullable: true })
  public publishedBy: string;

  @CreateDateColumn()
  @Field()
  public createdAt: Date;

  @UpdateDateColumn()
  @Field()
  public updatedAt: Date;

  @OneToMany(type => Document, document => document.release)
  public documents: Document[];

  @ManyToOne(type => User)
  public user: User;
}
