import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GraphQLJSON } from '../types/GraphQLJSON';
import { Schema } from './Schema';

@Entity()
@InputType('SchemaFieldInput')
@ObjectType()
export class SchemaField {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  public id: string;

  @Column()
  @Field()
  public name: string;

  @Column()
  @Field()
  public title: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public description: string;

  @Column()
  @Field()
  public type: string;

  @Column({ default: 'Main' })
  @Field()
  public group: string;

  @Column({ default: 0 })
  @Field()
  public position: number;

  @Column({ default: false })
  @Field()
  public primary: boolean;

  @Column('jsonb', { default: {} })
  @Field(type => GraphQLJSON)
  public options: any;

  @Field(type => [SchemaField], { nullable: true })
  public fields: SchemaField[];

  @Column({ nullable: true })
  public parentFieldId?: string;

  @ManyToOne(type => SchemaField, category => category.childFields)
  public parentField: SchemaField;

  @OneToMany(type => SchemaField, category => category.parentField)
  public childFields: SchemaField[];

  @Column()
  public schemaId: string;

  @ManyToOne(type => Schema, schema => schema.fields, { cascade: true, onDelete: 'SET NULL' })
  public schema: Schema;
}
