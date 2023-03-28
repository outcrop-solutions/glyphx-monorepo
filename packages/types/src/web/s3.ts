import {_Object} from '@aws-sdk/client-s3';

// S3 Rendering pipeline input
type ListObjectsCommandOutputContent = _Object;

export interface IS3ProviderListOutputItem {
  key: ListObjectsCommandOutputContent['Key'];
  eTag: ListObjectsCommandOutputContent['ETag'];
  lastModified: ListObjectsCommandOutputContent['LastModified'];
  size: ListObjectsCommandOutputContent['Size'];
}

export interface IS3ProviderListOutput {
  results: IS3ProviderListOutputItem[];
  nextToken?: string;
  hasNextToken: boolean;
}
