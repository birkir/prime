import GraphQLJSON from 'graphql-type-json';
import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';

@Entity()
@ObjectType()
export class UserMeta {
  @Column('uuid', { primary: true })
  public id: string;

  @Field(type => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', default: {} })
  public profile: any;
}
