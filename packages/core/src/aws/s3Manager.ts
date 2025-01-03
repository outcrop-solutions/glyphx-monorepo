import {S3, GetObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import * as error from '../error';
import {awsTypes} from 'types';
import {Readable} from 'node:stream';

/**`
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
  private initedField = false;

  /**
   * The property accessor for the bucket's name.
   */
  get bucketName(): string {
    return this.bucketNameField;
  }

  /**
   * return the inited field indicating that the init method has been called.
   */
  public get inited(): boolean {
    return this.initedField;
  }

  /**
   * The property accessor for the S3 client.  Note, you must call {@link init} before using this accessor.
   *
   * @throws InvalidOperationError - if we have not previously called {@link init}
   */
  private get bucket(): S3 {
    if (!this.initedField) throw new error.InvalidOperationError('you must call init before using this object', {});

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
  public async init() {
    try {
      await this.bucketField.headBucket({Bucket: this.bucketName});
      this.initedField = true;
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
  public async listObjects(filter: string, startAfter?: string): Promise<string[]> {
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
      results.Contents?.forEach((r) => {
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
  public async getFileInformation(fileName: string): Promise<awsTypes.IHeadObjectData> {
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
   * Will get a signedUrlPromise for client side file upload
   */

  public async getSignedUploadUrlPromise(key: string): Promise<any> {
    const putObjectParams = {
      Bucket: this.bucketName,
      Key: key,
      ContentType: '', // Set Content-Type header to empty string for unsigned body
    };
    const client = new S3Client({region: 'us-east-2'});
    const command = new PutObjectCommand(putObjectParams);

    // @ts-ignore
    const url = await getSignedUrl(client, command);
    return url;
  }

  public async getSignedDataUrlPromise(key: string): Promise<any> {
    const getObjectParams = {
      Bucket: this.bucketName,
      Key: key,
      ContentType: 'text/csv',
    };
    const client = new S3Client({region: 'us-east-2'});
    const command = new GetObjectCommand(getObjectParams);

    // @ts-ignore
    const url = await getSignedUrl(client, command, {expiresIn: 3600});
    return url;
  }

  /**
   * Will get a Readable stream to provide access to a file.
   *
   * @param key - the name of the file that you would like access to.
   *
   * @throws InvalidOperationError - If an error is thrown by the S3 client.
   */
  public async getObjectStream(key: string): Promise<Readable> {
    const bucketParameters = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const response = await this.bucket.getObject(bucketParameters);

      return response.Body as Readable;
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
  // @ts-ignore
  public getUploadStream(fileName: string, stream, contentType?: string) {
    const params: any = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: stream,
    };

    if (contentType) {
      params.ContentType = contentType;
    }

    const upload = new Upload({
      client: this.bucket,
      params: params,
    });

    return upload;
  }

  /**
   * This function will remove an object from the s3 bucket,
   *
   * @param fileName - the name/key of the object to remove.
   * @throws InvalidOperationError -- if S3 throws an error
   */
  public async removeObject(fileName: string) {
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

  /**
   * This function will non-destructively copy objects from one path to another path within the same bucket
   * @param fileName
   * @returns
   */
  public async copyObject(oldFileName: string, newFileName: string) {
    try {
      return await this.bucket.copyObject({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${oldFileName}`,
        Key: newFileName,
      });
    } catch (err) {
      throw new error.InvalidOperationError(
        `An error occurred while copying the object from the key: ${oldFileName} to the path: ${newFileName}. Are you sure that it exists and that you have access to update it?  See the inner error for additional information`,
        {newFileName, oldFileName},
        err
      );
    }
  }

  /**
   * This function will destructively copy the old path to the new path
   * @param oldFileName
   * @param newFileName
   */
  public async moveObject(oldFileName: string, newFileName: string) {
    try {
      await this.copyObject(oldFileName, newFileName);
      await this.removeObject(oldFileName);
    } catch (err) {
      throw new error.InvalidOperationError(
        `An error occurred while moving the object from the key: ${oldFileName} to the path: ${newFileName}. Are you sure that it exists and that you have access to update it?  See the inner error for additional information`,
        {newFileName, oldFileName},
        err
      );
    }
  }

  /**
   * Checks our underlying S3 bucket to determine whether or not the file exists.
   *
   * @param fileName -- the name (key) of the file to check
   */
  public async fileExists(fileName: string): Promise<boolean> {
    let retval = true;
    try {
      await this.bucket.headObject({Bucket: this.bucketName, Key: fileName});
    } catch (err) {
      retval = false;
    }

    return retval;
  }

  async putObject(key: string, content: string | Buffer): Promise<void> {
    try {
      await this.bucket.putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: content,
      });
    } catch (err) {
      throw new error.InvalidOperationError(
        'An unexpected error occurred while storing the object, See the inner error for more information',
        {key: key, bucketName: this.bucketName},
        err
      );
    }
  }
}
