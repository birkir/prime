import { User as AccountsUser } from '@accounts/typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { Entity, getRepository } from 'typeorm';
import { UserMeta } from './UserMeta';

@Entity()
@ObjectType()
export class User extends AccountsUser {
  @Field(type => ID)
  public id = super.id;

  public async meta(): Promise<UserMeta> {
    const metaRepo = getRepository(UserMeta);
    let meta = await metaRepo.findOne(this.id);
    if (!meta) {
      meta = new UserMeta();
      meta.id = this.id;
      await metaRepo.save(meta);
    }
    return meta;
  }
}
