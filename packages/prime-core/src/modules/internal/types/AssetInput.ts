import { GraphQLUpload } from 'graphql-upload';
import { Field, InputType } from 'type-graphql';
import { Upload } from '../../external/interfaces/Upload';

@InputType()
export class AssetInput {
  @Field(type => GraphQLUpload, { nullable: false })
  public upload: Promise<Upload>;
}
