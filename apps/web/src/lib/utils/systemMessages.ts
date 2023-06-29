import type { ChatCompletionRequestMessage } from 'openai-edge';

export const systemMessage = (fileStats, templates): ChatCompletionRequestMessage[] => [
  {
    role: 'system',
    content: `These are the relevant shapes:
  export interface IProjectTemplate {
    _id?: mongooseTypes.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    name: string;
    projects: IProject[];
    tags: ITag[];
    shape: Record<string, {type: string; required: boolean; description: string}>;
  }
  export interface IRecommendation {
    name: string;
    insights: string[]
  }
  export interface IFileStats {
    fileName: string;
    tableName: string;
    numberOfRows: number;
    numberOfColumns: number;
    columns: IColumn[];
    fileSize: number;
    dataGrid?: IRenderableDataGrid;
    open?: boolean;
    selected?: boolean;
  }
  export interface IColumn {
    name: string;
    fieldType: FIELD_TYPE;
    longestString?: number | undefined;
  }
  export enum FIELD_TYPE {
    NUMBER,
    STRING,
    INTEGER,
    DATE,
    UNKNOWN = 999,
  }`,
  },
  {
    role: 'system',
    content:
      'The purpose of this conversation is to help an end user model their csv data on an X, Y, Z axis (in three dimensions) using industry knowledge',
  },
  {
    role: 'system',
    content:
      'The high level goal is to identify columns in the uploaded files that map to the shape of ProjectTemplates. Columns in the uploaded fileStats may not match the shape columns exactly so it is necessary to infer what the columns mean in the context of analyzing logistics data',
  },
  {
    role: 'system',
    content:
      'Please strictly format the response as an array of shape IRecommendation[] where name corresponds to the recommended ProjectTemplate.name and insights are three one sentence insights that could be derived from such a model.',
  },
  {
    role: 'system',
    content: 'Only respond with valid json.',
  },
  {
    role: 'user',
    content: `These are the relavent iFileStats of the csv spreadsheet being uploaded ${JSON.stringify(
      fileStats
    )}. I need you to compare the fileStats of the uploaded file against these ProjectTemplates ${JSON.stringify(
      templates
    )}.`,
  },
];
