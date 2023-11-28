'use client';
import {encode} from 'base-64';
import {
  GetDocumentProps,
  GetDocumentsProps,
  GetDocumentsResponse,
  GetNextDocumentsProps,
  GetDocumentUsersProps,
  UpdateDefaultAccessProps,
  DocumentUser,
  CreateDocumentProps,
  CreateDocumentRequest,
  Document,
  Room,
  RemoveUserAccessProps,
  RemoveUserRequest,
  FetchApiResult,
  DeleteDocumentProps,
  GetDocumentGroupsProps,
  DocumentGroup,
  GetLiveUsersProps,
  LiveUsersResponse,
  RemoveGroupAccessProps,
  RemoveGroupRequest,
  UpdateGroupAccessProps,
  UpdateGroupRequest,
  UpdateUserAccessProps,
  UpdateUserRequest,
} from 'types';
import {fetchApiEndpoint} from './utils';

/**
 * Interact with Documents on the client via ServerDocumentManager api calls
 */
export class ClientDocumentManager {
  /**
   * Get Document - Used in /lib/client/getDocumentsByGroup
   *
   * Fetch a liveblocks document from documentId
   * Uses custom API endpoint
   *
   * @param documentId - The document id
   */
  public async getDocument({documentId}: GetDocumentProps): Promise<FetchApiResult<Document>> {
    const url = `/documents/${documentId}`;

    return fetchApiEndpoint<Document>(url);
  }

  /**
   * Get Documents
   *
   * Get a list of documents by projectId, userId, and metadata
   * Uses custom API endpoint
   *
   * @param projectIds - The groups to filter for
   * @param userId - The user to filter for
   * @param documentType - The document type to filter for
   * @param drafts - Get only drafts
   * @param limit - The amount of documents to retrieve
   */
  public async getDocuments({
    projectIds,
    userId,
    documentType,
    drafts = false,
    limit,
  }: GetDocumentsProps): Promise<FetchApiResult<GetDocumentsResponse>> {
    let url = `/documents?`;

    if (userId) {
      url += `&userId=${userId}`;
    }

    if (projectIds) {
      url += `&projectIds=${projectIds}`;
    }

    if (documentType) {
      url += `&documentType=${documentType}`;
    }

    if (drafts === true) {
      url += `&drafts=${true}`;
    }

    if (limit) {
      url += `&limit=${limit}`;
    }

    return fetchApiEndpoint<GetDocumentsResponse>(url);
  }

  /**
   * Create Document
   *
   * Create a new document, with a specified name and type, from userId and projectId
   * Uses custom API endpoint
   *
   * @param name - The name of the new document
   * @param type - The type of the new document e.g. "canvas"
   * @param projectIds - The new document's initial groups
   * @param userId - The user creating the document
   * @param draft - If the document is a draft (no public or group access, but can invite)
   */
  public async createDocument({
    name,
    type,
    projectIds,
    userId,
    draft = false,
  }: CreateDocumentProps): Promise<FetchApiResult<Document>> {
    const url = '/documents/create';

    const request: CreateDocumentRequest = {
      name,
      type,
      userId,
      projectIds: draft ? undefined : projectIds?.join(','),
      draft,
    };

    return fetchApiEndpoint<Document>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Delete Document
   *
   * Deletes a document from its id
   * Uses custom API endpoint
   *
   * @param documentId - The document's id
   */
  public async deleteDocument({documentId}: DeleteDocumentProps): Promise<FetchApiResult<Document>> {
    const url = `/documents/${documentId}`;

    return fetchApiEndpoint<Document>(url, {
      method: 'DELETE',
    });
  }
  /**
   * Get Document Groups
   *
   * Get the projectIds attached to a given document
   * Uses custom API endpoint
   *
   * @param documentId - The document id
   */
  public async getDocumentGroups({documentId}: GetDocumentGroupsProps): Promise<FetchApiResult<DocumentGroup[]>> {
    const url = `/documents/${documentId}/groups`;

    return fetchApiEndpoint<DocumentGroup[]>(url);
  }

  /**
   * Get Document Users
   *
   * Get the DocumentUsers in a given document
   * Uses custom API endpoint
   *
   * @param documentId - The document id
   */
  public async getDocumentUsers({documentId}: GetDocumentUsersProps): Promise<FetchApiResult<DocumentUser[]>> {
    const url = `/documents/${documentId}/users`;

    return fetchApiEndpoint<DocumentUser[]>(url);
  }

  /**
   * Get Live Users
   *
   * Get the online users in the documents passed
   * Uses custom API endpoint
   *
   * @param documentIds - An array of document ids
   */
  public async getLiveUsers({documentIds}: GetLiveUsersProps): Promise<FetchApiResult<LiveUsersResponse[]>> {
    const url = '/documents/liveUsers';
    return fetchApiEndpoint<LiveUsersResponse[]>(url, {
      method: 'POST',
      body: JSON.stringify(documentIds),
    });
  }

  /**
   * Get Next Documents
   *
   * Get the next set of documents using userId and nextPage.
   * nextPage can be retrieved from getDocumentsByGroup.ts
   * Uses custom API endpoint
   *
   * @param nextPage - nextPage, retrieved from getDocumentByGroup
   */
  public async getNextDocuments({nextPage}: GetNextDocumentsProps): Promise<FetchApiResult<GetDocumentsResponse>> {
    const next = encode(nextPage);
    const url = `/documents/next?nextPage=${next}`;
    return fetchApiEndpoint<GetDocumentsResponse>(url);
  }

  /**
   * Remove Group Access
   *
   * Remove a group from a given document with its projectId
   * Uses custom API endpoint
   *
   * @param projectId - The id of the removed group
   * @param documentId - The document id
   */
  public async removeGroupAccess({
    projectId,
    documentId,
  }: RemoveGroupAccessProps): Promise<FetchApiResult<DocumentGroup[]>> {
    const url = `/documents/${documentId}/groups`;

    const request: RemoveGroupRequest = {
      projectId,
    };

    return fetchApiEndpoint<DocumentGroup[]>(url, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  /**
   * Remove User Access
   *
   * Remove a user from a given document with their userId
   * Uses custom API endpoint
   *
   * @param userId - The id of the removed user
   * @param documentId - The document id
   */
  public async removeUserAccess({userId, documentId}: RemoveUserAccessProps): Promise<FetchApiResult<DocumentUser[]>> {
    const url = `/documents/${documentId}/users`;

    const request: RemoveUserRequest = {
      userId,
    };

    return fetchApiEndpoint<DocumentUser[]>(url, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  /**
   * Update Default Access
   *
   * Given a document, update its default access
   * Uses custom API endpoint
   *
   * @param documentId - The document to update
   * @param access - The new DocumentAccess permission level
   */
  public async updateDefaultAccess({documentId, access}: UpdateDefaultAccessProps): Promise<FetchApiResult<Document>> {
    const url = `/documents/${documentId}/defaultAccess`;

    return fetchApiEndpoint<Document>(url, {
      method: 'POST',
      body: JSON.stringify({access: access}),
    });
  }

  /**
   * Update Document Name
   *
   * Given a document, update its name
   * Uses custom API endpoint
   *
   * @param document - The document to update
   * @param name - The document's new name
   */
  public async updateDocumentName({
    documentId,
    name,
  }: {
    documentId: Document['id'];
    name: Document['name'];
  }): Promise<FetchApiResult<Document>> {
    const url = `/documents/${documentId}`;

    const documentData: {metadata: Partial<Room['metadata']>} = {
      metadata: {name},
    };

    return fetchApiEndpoint(url, {
      method: 'POST',
      body: JSON.stringify({
        documentData,
      }),
    });
  }

  /**
   * Update Group Access
   *
   * Add a group to a given document with their projectId
   * Uses custom API endpoint
   *
   * @param projectId - The id of the group
   * @param documentId - The document id
   * @param access - The access level of the user
   */
  public async updateGroupAccess({
    projectId,
    documentId,
    access,
  }: UpdateGroupAccessProps): Promise<FetchApiResult<DocumentUser[]>> {
    const url = `/documents/${documentId}/groups`;

    const request: UpdateGroupRequest = {
      projectId,
      access,
    };

    return fetchApiEndpoint<DocumentUser[]>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Update User Access
   *
   * Add a collaborator to a given document with their userId
   * Uses custom API endpoint
   *
   * @param userId - The id of the invited user
   * @param documentId - The document id
   * @param access - The access level of the user
   */
  public async updateUserAccess({
    userId,
    documentId,
    access,
  }: UpdateUserAccessProps): Promise<FetchApiResult<DocumentUser[]>> {
    const url = `/documents/${documentId}/users`;

    const request: UpdateUserRequest = {
      userId,
      access,
    };

    return fetchApiEndpoint<DocumentUser[]>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}
