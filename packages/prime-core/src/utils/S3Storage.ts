import S3 from 'aws-sdk/clients/s3';
import fileType from 'file-type';
import { ReadStream } from 'fs';
import { Service } from 'typedi';
import uuidv4 from 'uuid/v4';
import { Asset } from '../entities/Asset';

@Service()
export class S3Storage {
  private bucket: string;
  private s3: S3;

  constructor() {
    if (!process.env.S3_BUCKET) {
      throw Error('S3_BUCKET not set');
    }
    if (!process.env.S3_ACCESS_KEY_ID) {
      throw Error('S3_ACCESS_KEY_ID not set');
    }
    if (!process.env.S3_SECRET_ACCESS_KEY) {
      throw Error('S3_SECRET_ACCESS_KEY not set');
    }

    this.bucket = process.env.S3_BUCKET;
    this.s3 = new S3({
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  public async upload(fileName: string, readStream1: ReadStream): Promise<Partial<Asset>> {
    // TODO: Detect width/height of image types

    const readStream2 = await fileType.stream(readStream1);
    const { mime } = readStream2.fileType!;

    const handle = uuidv4();
    const data = await this.s3
      .upload({
        Bucket: this.bucket,
        ACL: 'public-read',
        Body: readStream2,
        Key: handle,
        ContentType: mime,
      })
      .promise();
    const head = await this.head(handle);
    return {
      fileName,
      fileSize: head.ContentLength,
      handle,
      mimeType: mime,
      url: data.Location,
    };
  }

  public async delete(fileName: string): Promise<boolean> {
    const data = await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: fileName,
      })
      .promise();
    return data.DeleteMarker || false;
  }

  private async head(fileName: string) {
    return this.s3
      .headObject({
        Bucket: this.bucket,
        Key: fileName,
      })
      .promise();
  }
}
