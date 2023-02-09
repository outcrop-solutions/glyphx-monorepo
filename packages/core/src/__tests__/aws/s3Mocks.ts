import s3MockData from './s3MockData.json';
import {
  GetObjectOutput,
  HeadObjectOutput,
  ListObjectsV2Request,
  DeleteObjectOutput,
  PutObjectCommandOutput,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';

import {Readable} from 'node:stream';

interface IS3MockOptions {
  failsOnHeadBucket?: string; //the messages to throw.
  failsOnHeadObject?: string; //the messages to throw.
  failsOnListObjects?: string;
  failsOnGetObjects?: string;
  failsOnDelteObject?: string;
  failsOnPutObject?: string;
  numberOfObjects?: number;
  headObjectFileSize?: number;
  getObjectStream?: Readable;
}

export class S3Mock {
  private keys: string[];
  private options?: IS3MockOptions;
  private putFileNameField: string;

  public get putFileName() {
    return this.putFileNameField;
  }
  constructor(options?: IS3MockOptions) {
    this.options = options;
    this.keys = [];
    this.putFileNameField = '';
  }

  async headBucket() {
    if (this.options?.failsOnHeadBucket) throw this.options.failsOnHeadBucket;
    else return true;
  }
  async headObject(): Promise<HeadObjectOutput> {
    if (this.options?.failsOnHeadObject) throw this.options.failsOnHeadObject;
    else
      return {
        ContentLength: this.options?.headObjectFileSize ?? 1000,
        LastModified: new Date(),
      };
  }

  async listObjectsV2(options: ListObjectsV2Request) {
    if (this.options?.failsOnListObjects) throw this.options.failsOnListObjects;

    if (!options.StartAfter) {
      this.keys = [];
      const numberToInclude = this.options?.numberOfObjects ?? 1000;
      for (let i = 0; i < numberToInclude; i++)
        this.keys.push(`${options.Prefix ?? ''}file-${i}`);
      const {truncated, numberToTake} =
        numberToInclude > 1000
          ? {truncated: true, numberToTake: 1000}
          : {truncated: false, numberToTake: numberToInclude};

      const retval = {
        IsTruncated: truncated,
        Contents: this.keys.slice(0, numberToTake).map(k => {
          return {Key: k};
        }),
        KeyCount: numberToInclude,
        MaxKeys: 1000,
        Prefix: options.Prefix,
      };
      return retval;
    } else {
      const startIndex = this.keys.findIndex(k => k === options.StartAfter) + 1;
      if (startIndex === -1)
        return {
          IsTruncated: false,
          Contents: [],
          KeyCount: 0,
          Prefix: options.Prefix,
        };

      const {truncated, numberToTake} =
        this.keys.length - startIndex > 1000
          ? {truncated: true, numberToTake: 1000}
          : {truncated: false, numberToTake: this.keys.length - startIndex};
      const retval = {
        IsTruncated: truncated,
        Contents: this.keys
          .slice(startIndex, startIndex + numberToTake)
          .map(k => {
            return {Key: k};
          }),
        KeyCount: numberToTake,
        Prefix: options.Prefix,
      };

      return retval;
    }
  }

  async getObject(): Promise<GetObjectOutput> {
    if (this.options?.failsOnGetObjects) throw this.options.failsOnGetObjects;
    else {
      if (this.options?.getObjectStream)
        return {Body: this.options.getObjectStream};
      else {
        const buffer = Buffer.from(JSON.stringify(s3MockData));
        const readableSteam = Readable.from(buffer);
        return {Body: readableSteam};
      }
    }
  }

  async removeObject(): Promise<DeleteObjectOutput> {
    if (this.options?.failsOnDelteObject)
      throw this.options?.failsOnDelteObject;
    else {
      return true as unknown as DeleteObjectOutput;
    }
  }

  async putObject(
    input: PutObjectCommandInput
  ): Promise<PutObjectCommandOutput> {
    this.putFileNameField = input.Key ?? '';
    if (this.options?.failsOnPutObject) {
      throw this.options?.failsOnPutObject;
    } else {
      return {
        ETag: input.Key,
      } as PutObjectCommandOutput;
    }
  }
}
