import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Schema } from './Schema';

@Entity()
export class SchemaField {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column()
  public title: string;

  @Column({ nullable: true })
  public description: string;

  @Column()
  public type: string;

  @Column({ default: 'Main' })
  public group: string;

  @Column({ default: 0 })
  public position: number;

  @Column({ default: false })
  public primary: boolean;

  @ManyToOne(type => SchemaField, category => category.childFields)
  public parentField: SchemaField;

  @OneToMany(type => SchemaField, category => category.parentField)
  public childFields: SchemaField[];

  @ManyToOne(type => Schema, schema => schema.fields, { cascade: true, onDelete: 'SET NULL' })
  public schema: Schema;

  @Column('jsonb', { default: {} })
  public options: any;
}
