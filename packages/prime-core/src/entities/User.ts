import { User as AccountsUser } from '@accounts/typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { Entity, getRepository } from 'typeorm';
import { UserMeta } from './UserMeta';

@Entity()
@ObjectType()
export class User extends AccountsUser {
  public static async meta(id: string): Promise<UserMeta> {
    const metaRepo = getRepository(UserMeta);
    let meta = await metaRepo.findOne(id);

    if (!meta) {
      meta = new UserMeta();
      meta.id = id;
      await metaRepo.save(meta);
    }

    return meta;
  }

  @Field(type => ID)
  public id = super.id;
}
