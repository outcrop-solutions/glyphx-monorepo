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
      'Please strinctly format the response in the format "Your uploaded file fits the following templates: <project templates>" where <project templates> are the templates you recommend and a quick, three bullet point analysis of what insights you could draw from using each model',
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
