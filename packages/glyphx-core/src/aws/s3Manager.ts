import {S3} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage';
import * as error from '../error';
import { aws } from '@glyphx/types';
import {PassThrough} from 'node:stream';

/**
 * This class provides basic operations for working with S3 buckets.
 */
export class S3Manager {
  /**
   * The name of the bucket that this instance is associated with.
   */
  private readonly bucketNameField: string;
  /**
   * The S3 client that this associated with this instance.
   */
  private bucketField: S3;
  /**
   * determines whether or not the init method has been called on this instance.
   */
  private inited = false;

  /**
   * The property accessor for the bucket's name.
   */
  get bucketName(): string {
    return this.bucketNameField;
  }

  /**
   * The property accessor for the S3 client.  Note, you must call {@link init} before using this accessor.
   *
   * @throws InvalidOperationError - if we have not previously called {@link init}
   */
  private get bucket(): S3 {
    if (!this.inited)
      throw new error.InvalidOperationError(
        'you must call init before using this object',
        {}
      );

    return this.bucketField;
  }

  /**
   * Builds a new instance of our S3Manager.
   *
   * @param bucketName - the name of our bucket,
   */
  constructor(bucketName: string) {
    this.bucketNameField = bucketName;
    this.bucketField = new S3({});
  }

  /**
   * This function must be called before interacting with any of the other functions in this class.  Calling
   * init will verify that the bucket exists and that you have access to it.
   *
   * @throws InvalidArgumentError if the bucket does not exist, or you do not have access to it.
   */
  async init() {
    try {
      await this.bucketField.headBucket({Bucket: this.bucketName});
      this.inited = true;
    } catch (err) {
      throw new error.InvalidArgumentError(
        `An error occurred while checking for the existance of the bucket : ${this.bucketName}.  See the inner error for additional details`,
        'bucketName',
        this.bucketName,
        err
      );
    }
  }

  /**
   * will return the full list of objects in a bucket that match the filter.
   * By default, S3 will only return 1000 objects.  This function will recursivly
   * call itself to get all of the objects.
   *
   * @param filter - the key's to search for.
   * @startAfter - is sent to S3, to return a subset of items.
   *
   * @throws InvalidOperationError if you do not have list permissions for the filter on the bucket.
   */
  async listObjects(filter: string, startAfter?: string): Promise<string[]> {
    const options: {Bucket: string} & Record<string, string> = {
      Bucket: this.bucketName,
      Prefix: filter,
    };

    if (startAfter) {
      options['StartAfter'] = startAfter;
    }
    try {
      const results = await this.bucket.listObjectsV2(options);
      const retval: string[] = [];
      //istanbul ignore next
      results.Contents?.forEach(r => {
        retval.push(r.Key as string);
      });

      if (results.IsTruncated) {
        const startAfterKey = retval[retval.length - 1];
        const subResults = await this.listObjects(filter, startAfterKey);
        retval.push(...subResults);
      }
      return retval;
    } catch (err) {
      throw new error.InvalidOperationError(
        `An unexpected error occurred while retreiving objects from bucket: ${this.bucketName} with the filter: ${filter}.  See the inner exception for additional details`,
        {Bucket: this.bucketName, filter},
        err
      );
    }
  }

  /**
   * returns information about a file in the S3 bucket.
   *
   * @param fileName - the name of the file to get information about.
   *
   * @throws InvalidArgumentError - if the file does not exist iin the bucket, or you do not have permissions to access it.
   */
  async getFileInformation(fileName: string): Promise<aws.IHeadObjectData> {
    try {
      const result = await this.bucket.headObject({
        Bucket: this.bucketName,
        Key: fileName,
      });
      //istanbul ignore next
      const fileSize = result.ContentLength ?? -1;
      return {
        fileName: fileName,
        fileSize: fileSize,
        lastModified: result.LastModified,
      };
    } catch (err) {
      throw new error.InvalidArgumentError(
        `An error occurred while getting the object : ${fileName} information from the bucket: ${this.bucketName}. Are you sure that the object exists and that you have access to it?  See the inner error for additional information`,
        'fileName',
        fileName,
        err
      );
    }
  }

  /**
   * Will get a Readable stream to provide access to a file.
   *
   * @param key - the name of the file that you would like access to.
   *
   * @throws InvalidOperationError - If an error is thrown by the S3 client.
   */
  async getObjectStream(key: string): Promise<any> {
    const bucketParameters = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const response = await this.bucket.getObject(bucketParameters);

      return response.Body;
    } catch (err) {
      throw new error.InvalidOperationError(
        `An error occurred while setting up the stream.  Are you sure that the file ${key} exists and that you have permissions to access it?  See the innerError for additional details`,
        {},
        err
      );
    }
  }

  /**
   *  This function will allow a client to upload a stream using
   *  a multipart upload to upload a file directly from memory to
   *  to S3.
   *
   *  @param fileName - the name of the file to create in S3.
   *  @param stream - a pass through stream that will stream the data to be uploaded.
   */
  getUploadStream(fileName: string, stream: PassThrough) {
    const upload = new Upload({
      client: this.bucket,
      params: {
        Bucket: this.bucketName,
        Key: fileName,
        Body: stream,
      },
    });

    return upload;
  }

  /**
   * This function will remove an object from the s3 bucket,
   *
   * @param fileName - the name/key of the object to remove.
   * @throws InvalidOperationError -- if S3 throws an error
   */
  async removeObject(fileName: string) {
    try {
      await this.bucket.deleteObject({
        Bucket: this.bucketName,
        Key: fileName,
      });
    } catch (err) {
      throw new error.InvalidOperationError(
        `An error occurred while removing the object with the key: ${fileName}. Are you sure that it exists and that you have access to remove it?  See the inner error for additional information`,
        {fileName},
        err
      );
    }
  }
}
