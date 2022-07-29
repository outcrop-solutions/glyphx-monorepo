export type Project = {
  id: string | null;
  createdAt: Date;
  updatedAt: Date;
  name: string | null;
  description: string | null;
  filePath: string | null;
  expiry: Date | null; // needs to be removed from the schema
  properties: string[] | null;
  url: string | null;
  author: string | null;
  shared: string[] | null;
};

export enum ColumnType {
  NUMERICAL = "NUMERICAL",
  STRING = "STRING",
}

// Will be used to support 3+ columns
export type Column = {
  id: string | null;
  createdAt: Date;
  updatedAt: Date;
  parentFile: string | null; // not live yet but will add support for multiple csv
  type: ColumnType; //not live yet but will support multiple csv and columns
  name: string | null;
  min: number | null;
  max: number | null;
  projectID: string;
};

export type Filter = {
  id: string | null;
  createdAt: Date;
  updatedAt: Date;
  name: string | null;
  projectID: string;
};

export type State = {
  id: string | null;
  createdAt: Date;
  updatedAt: Date;
  title: string | null;
  description: string | null;
  camera: State | null;
  query: string | null;
  projectID: string | null;
};

export type Comment = {
  id: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: string | null;
  stateID: string | null;
  content: string | null;
};
