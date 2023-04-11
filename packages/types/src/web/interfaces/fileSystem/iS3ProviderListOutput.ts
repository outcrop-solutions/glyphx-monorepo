import {IS3ProviderListOutputItem} from './iS3ProviderListOutputItem';

export interface IS3ProviderListOutput {
  results: IS3ProviderListOutputItem[];
  nextToken?: string;
  hasNextToken: boolean;
}
