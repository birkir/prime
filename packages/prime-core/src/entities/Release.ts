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
import { User } from './User';

@Entity()
export class Release {
  @PrimaryGeneratedColumn('uuid')
  public id: any;

  @Column()
  public name: string;

  @Column({ nullable: true })
  public description: string;

  @Column({ type: 'timestamp', nullable: true })
  public scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  public publishedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToMany(type => Document, document => document.release)
  public documents: Document[];

  @ManyToOne(type => User)
  public user: User;
}
