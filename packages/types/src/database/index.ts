export * as meta from './meta';
import {Types as mongooseTypes} from 'mongoose';

// TABLES
export interface IWorkspace {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  workspaceCode: string;
  inviteCode: string;
  name: string;
  slug: string;
  tags: ITag[];
  description?: string;
  creator: IUser;
  members: IMember[];
  projects: IProject[];
  filesystem: IFileStats[];
  states: IState[];
}

export interface IUser {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  userCode: string;
  name: string;
  username: string;
  gh_username?: string;
  email: string;
  emailVerified?: Date;
  isVerified: boolean;
  image?: string;
  accounts: IAccount[];
  sessions: ISession[];
  membership: IMember[];
  invitedMembers: IMember[];
  createdWorkspaces: IWorkspace[];
  projects: IProject[];
  customerPayment?: ICustomerPayment;
  webhooks: IWebhook[];
  apiKey?: string;
}

export interface IMember {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  updatedAt: Date;
  createdAt: Date;
  deletedAt?: Date;
  email: string;
  inviter: string;
  type: MEMBERSHIP_TYPE; // PROJECT ? project present : project: undefined
  invitedAt: Date;
  joinedAt?: Date;
  status: INVITATION_STATUS;
  teamRole?: ROLE;
  projectRole?: PROJECT_ROLE;
  member: IUser;
  invitedBy: IUser;
  workspace: IWorkspace;
  project?: IProject;
}

export interface IAccount {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  type: ACCOUNT_TYPE;
  userId?: string;
  provider: ACCOUNT_PROVIDER;
  providerAccountId: string;
  refresh_token: string;
  refresh_token_expires_in: number;
  access_token: string;
  expires_at: number;
  token_type: TOKEN_TYPE;
  scope: string;
  id_token: string;
  session_state: SESSION_STATE;
  oauth_token_secret: string;
  oauth_token: string;
  user: IUser;
}

export interface IProject {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  name: string;
  description?: string;
  sdtPath?: string;
  workspace: IWorkspace;
  lastOpened?: Date;
  imageHash?: string;
  aspectRatio?: Aspect;
  slug?: string;
  template?: IProjectTemplate;
  members: IMember[];
  tags: ITag[];
  currentVersion?: number;
  state: Record<string, Property>;
  states: IState[];
  files: FileStats[];
  filesystem: IFileStats[];
  viewName?: string;
}

export interface IProjectTemplate {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  community?: boolean;
  name: string;
  description?: string;
  projects: IProject[];
  tags: ITag[];
  shape: Record<string, {key: string; type: FIELD_TYPE; required: boolean; description: string}>;
}

export interface IFileStats {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  fileName: string;
  tableName: string;
  numberOfRows: number;
  numberOfColumns: number;
  columns: Column[];
  fileSize: number;
  dataGrid?: RenderableDataGrid;
  open?: boolean;
  selected?: boolean;
}

export interface IState {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdBy: IUser;
  createdAt: Date;
  deletedAt?: Date;
  name: string;
  updatedAt: Date;
  version: number;
  static: boolean;
  imageHash?: string;
  camera: Camera;
  aspectRatio: Aspect;
  properties: Record<string, Property>;
  fileSystemHash: string; // corresponds to MD5 hash of S3 directory structure (underlying data) determines whether filtering is available
  payloadHash: string; // corresponds to unique file path derived from fileSystem hash + payload data. States will share a payloadHash if the underlying data, and payload used to generate the sdt are the same.
  description?: string;
  project: IProject;
  workspace: IWorkspace;
  fileSystem: FileStats[];
  document: IDocument;
}

// Collaborative Document for user state references
export interface IDocument {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  presence?: IPresence[];
  annotations?: IAnnotation[];
  thresholds?: IThreshold[];
  configs?: IModelConfig[];
}

export interface IAnnotation {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  content: string;
  author: IUser;
  state: IState;
}

export interface IPresence {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  cursor: Cursor;
  camera: Camera; // collaborative camera position (multi-player)
  config: IModelConfig; // collaborative model configuration
}

export interface IThreshold {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  name: string;
  actionType: ACTION_TYPE;
  actionPayload: Record<string, unknown>;
  value?: number;
  operator?: THRESHOLD_OPERATOR;
}

export interface IModelConfig {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  updatedAt: Date;
  createdAt: Date;
  deletedAt?: Date;
  name: string;
  current: boolean;
  min_color: Color;
  max_color: Color;
  background_color: Color;
  x_axis_color: Color;
  y_axis_color: Color;
  z_axis_color: Color;
  grid_cylinder_radius: number;
  grid_cylinder_length: number;
  grid_cone_length: number;
  grid_cone_radius: number;
  glyph_offset: number;
  z_height_ratio: number;
  z_offset: number;
  toggle_grid_lines: boolean;
  toggle_glyph_offset: boolean;
  toggle_z_offset: boolean;
}

export interface ITag {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  workspaces: IWorkspace[];
  templates: IProjectTemplate[];
  projects: IProject[];
  value: string;
}

export interface IActivityLog {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  actor: IUser;
  workspace?: IWorkspace;
  project?: IProject;
  location: string; // IP address
  userAgent: IUserAgent;
  action: ACTION_TYPE;
  onModel: RESOURCE_MODEL;
}

export interface ICustomerPayment {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  paymentId: string;
  email?: string;
  subscriptionType: SUBSCRIPTION_TYPE;
  customer: IUser;
}

export interface IProcessTracking {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  processId: string;
  processName: string;
  processStatus: PROCESS_STATUS;
  processStartTime: Date;
  processEndTime?: Date;
  processMessages: string[];
  processError: Record<string, unknown>[];
  processResult?: Record<string, unknown>;
  processHeartbeat?: Date;
}

export interface ISession {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  userId?: string;
  sessionToken: string;
  expires: Date;
  user: IUser;
}

export interface IUserAgent {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  userAgent?: string;
  platform?: string;
  appName?: string;
  appVersion?: string;
  vendor?: string;
  language?: string;
  cookieEnabled?: boolean;
}

export interface IVerificationToken {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  identifier: string;
  token: string;
  expires: Date;
}

export interface IWebhook {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  name: string;
  url: string;
  user: IUser;
}

// SCHEMAS
export type Color = {r: number; g: number; b: number; a: number};

export type Camera = {
  posx: number;
  posy: number;
  posz: number;
  dorx: number;
  dory: number;
  dorz: number;
};

export type Cursor = {
  x: number;
  y: number;
};

export type Aspect = {
  height: number;
  width: number;
};

export type Column = {
  name: string;
  fieldType: FIELD_TYPE;
  longestString?: number | undefined;
};

export type FileStats = {
  fileName: string;
  tableName: string;
  numberOfRows: number;
  numberOfColumns: number;
  columns: Column[];
  fileSize: number;
  dataGrid?: RenderableDataGrid;
  open?: boolean;
  selected?: boolean;
};

export type RenderableDataGrid = {
  columns: GridColumn[];
  rows: any[];
};

export type GridColumn = {
  key: string;
  dataType: FIELD_TYPE;
  width: number;
  resizable: boolean;
  sortable: boolean;
};

export type Property = {
  axis: AXIS;
  accepts: ACCEPTS;
  key: string; // corresponds to column name
  dataType: FIELD_TYPE; // corresponds to column data type
  interpolation: INTERPOLATION_TYPE;
  direction: DIRECTION_TYPE;
  filter: Filter;
  description?: string;
};

export type Filter = NumbericFilter | StringFilter;

export type NumbericFilter = {
  min: number;
  max: number;
};

export type StringFilter = {
  keywords: string[];
};

// ENUMS
export enum FIELD_TYPE {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  DATE = 'DATE',
  UNKNOWN = '999',
}

export enum ACCOUNT_PROVIDER {
  COGNITO = 'COGNITO',
}

export enum ACCOUNT_TYPE {
  GLYPHX = 'GLYPHX',
  CUSTOMER = 'CUSTOMER',
}

export enum ACTION_TYPE {
  CREATED = 'CREATED',
  FILES_INGESTED = 'FILES_INGESTED',
  MODEL_GENERATED = 'MODEL_GENERATED',
  UPDATED = 'UPDATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  DELETED = 'DELETED',
  MOVED = 'MOVED',
  WORKSPACE_JOINED = 'WORKSPACE_JOINED',
  INVITED = 'INVITED',
  INVITATION_DECLINED = 'INVITATION_DECLINED',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  PROCESS_TRACKING = 'PROCESS_TRACKING',
}

export enum ANNOTATION_TYPE {
  PROJECT = 'PROJECT',
  STATE = 'STATE',
}

export enum INVITATION_STATUS {
  ACCEPTED = 'ACCEPTED',
  PENDING = 'PENDING',
  DECLINED = 'DECLINED',
}

export enum MEMBERSHIP_TYPE {
  PROJECT = 'PROJECT',
  WORKSPACE = 'WORKSPACE',
}

export enum PROCESS_STATUS {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  HUNG = 'HUNG',
}

export enum PROJECT_ROLE {
  READ_ONLY = 'READ_ONLY',
  CAN_EDIT = 'CAN_EDIT',
  OWNER = 'OWNER',
}

export enum RESOURCE_MODEL {
  USER = 'user',
  PROJECT = 'project',
  STATE = 'state',
  CUSTOMER_PAYMENT = 'customerPayment',
  MEMBER = 'member',
  WEBHOOK = 'webhook',
  WORKSPACE = 'workspace',
  PROCESS_TRACKING = 'processTracking',
}

export enum ROLE {
  MEMBER = 'MEMBER',
  OWNER = 'OWNER',
}

export enum SESSION_STATE {
  NEW = 'NEW',
  SAVED = 'SAVED',
  DELETED = 'DELETED',
}

export enum SUBSCRIPTION_TYPE {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

export enum TOKEN_TYPE {
  ID = 'ID',
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}

export enum ACCEPTS {
  COLUMN_DRAG = 'COLUMN_DRAG',
}

export enum AXIS {
  X = 'X',
  Y = 'Y',
  Z = 'Z',
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum INTERPOLATION_TYPE {
  LIN = 'LIN',
  LOG = 'LOG',
}

export enum DIRECTION_TYPE {
  ASC = 'ASC',
  DESC = 'DESC',
}

// used to construct decision rule for action trigger
export enum THRESHOLD_OPERATOR {
  GT = 'GT', // greater than
  LT = 'LT', // greater than
  EQ = 'EQ', // equal to
}
