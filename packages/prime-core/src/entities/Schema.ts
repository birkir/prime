import { User } from '@accounts/typeorm';
import { Matches } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { startCase } from 'lodash';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Document } from './Document';
import { SchemaField } from './SchemaField';

export enum SchemaVariant {
  Default,
  Slice,
  Template,
}

@Entity()
@ObjectType()
export class Schema {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  public id: string;

  @Column({ unique: true })
  @Matches(/^[A-Za-z][A-Za-z0-9]+$/, { message: 'not in alphanumeric' })
  @Field()
  public name: string;

  @Column()
  @Field()
  public title: string;

  @Column('enum', { enum: SchemaVariant, default: SchemaVariant.Default })
  @Field(type => SchemaVariant)
  public variant: SchemaVariant; // was "isSlice" and "isTemplate"

  @Column('jsonb', { default: [] })
  @Field(type => GraphQLJSON)
  public groups: any;

  @Column('jsonb', { default: {} })
  @Field(type => GraphQLJSON)
  public settings: any;

  @CreateDateColumn()
  @Field()
  public createdAt: Date;

  @UpdateDateColumn()
  @Field()
  public updatedAt: Date;

  @OneToMany(type => Schema, schema => schema.documents)
  public documents: Document[];

  @OneToMany(type => SchemaField, field => field.schema)
  public fields: SchemaField[];

  @ManyToOne(type => User)
  public user: User;

  @BeforeInsert()
  public async setName() {
    if (!this.name && this.title) {
      const { title, variant } = this;
      const contentTypes = getRepository(Document);
      const baseName = startCase(title).replace(/ /g, '');
      let name = baseName;
      let count = 1;
      let i = 1;
      while (count === 1) {
        count = await contentTypes.count({ where: { name, variant } });
        if (count === 1) {
          name = `${baseName}${i}`;
          i += 1;
        }
      }
      this.name = name;
    }
  }
}
