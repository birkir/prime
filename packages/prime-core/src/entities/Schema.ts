import { Matches } from 'class-validator';
import { startCase } from 'lodash';
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
import { User } from './User';

enum SchemaVariant {
  Default,
  Slice,
  Template,
}

@Entity()
export class Schema {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  @Matches(/^[A-Za-z][A-Za-z0-9]+$/, { message: 'not in alphanumeric' })
  public name: string;

  @Column()
  public title: string;

  @Column('enum', { enum: SchemaVariant, default: SchemaVariant.Default })
  public variant: SchemaVariant; // was "isSlice" and "isTemplate"

  @Column('jsonb', { default: [] })
  public groups: any;

  @Column('jsonb', { default: {} })
  public settings: any;

  @OneToMany(type => Schema, schema => schema.documents)
  public documents: Document[];

  @OneToMany(type => SchemaField, field => field.schema)
  public fields: SchemaField[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

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

  // @BelongsTo(() => User, 'userId')
  // public user: User;
}
