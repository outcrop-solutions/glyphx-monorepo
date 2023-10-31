import {Document, DocumentAccess, DocumentGroup, DocumentType, DocumentUser} from './document';
import {Room, RoomActiveUser} from './room';

/**
 * These types are used to unify the client/server API endpoints
 */

export type GetDocumentsResponse = {
  documents: Document[];
  nextPage: string | null;
};

export type GetStorageResponse = Record<string, unknown>;

export type CreateDocumentRequest = {
  name: Document['name'];
  type: DocumentType;
  userId: DocumentUser['id'];
  projectIds?: string; // Comma separated list of projectIds
  draft?: boolean;
};

export type UpdateDocumentRequest = {
  documentData: Partial<Room>;
};

export type UpdateDocumentScope = {
  access: DocumentAccess;
};

export type UpdateGroupRequest = {
  projectId: DocumentGroup['id'];
  access: DocumentAccess;
};

export type RemoveGroupRequest = {
  projectId: DocumentGroup['id'];
};

export type UpdateUserRequest = {
  userId: DocumentUser['id'];
  access: DocumentAccess;
};

export type RemoveUserRequest = {
  userId: DocumentUser['id'];
};

export type GetRoomsResponse = {
  nextPage: string | null;
  data: Room[];
};

export type LiveUsersResponse = {
  documentId: Document['id'];
  users: RoomActiveUser[];
};

export type ErrorData = {
  message: string;
  code?: number;
  suggestion?: string;
};

export type FetchApiResult<T = unknown> =
  | {
      data: T;
      error?: never;
    }
  | {
      error: ErrorData;
      data?: never;
    };
