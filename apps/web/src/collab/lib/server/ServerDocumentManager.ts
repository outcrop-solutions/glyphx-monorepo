import {nanoid} from 'nanoid';
import {getServerSession} from 'next-auth';
import {decode} from 'base-64';
import {
  // METHOD PROPS
  CreateDocumentProps,
  UpdateDocumentProps,
  UpdateGroupAccessProps,
  DeleteDocumentProps,
  GetDocumentProps,
  GetDocumentGroupsProps,
  GetDocumentsProps,
  GetDocumentUsersProps,
  GetLiveUsersProps,
  GetNextDocumentsProps,
  RemoveGroupAccessProps,
  RemoveUserAccessProps,
  UpdateDefaultAccessProps,
  UpdateUserAccessProps,
  //  API SPECIFIC
  GetDocumentsResponse,
  LiveUsersResponse,
  FetchApiResult,
  // DOCUMENT
  Document,
  DocumentRoomMetadata,
  DocumentGroup,
  DocumentUser,
  // ROOM
  RoomAccess,
  RoomAccesses,
  RoomAccessLevels,
  RoomMetadata,
} from '../../types';

import {
  getDraftsGroupName,
  buildProjects,
  buildDocuments,
  userAllowedInRooms,
  isUserDocumentOwner,
  documentAccessToRoomAccesses,
  buildDocumentUsers,
} from './utils';

import {LiveBlocksManager} from 'collab/lib/server/LiveBlocksManager';
import {DOCUMENT_URL} from '../../constants';
import {userAllowedInRoom, buildDocument} from './utils';
import {prisma} from 'database';
import {authOptions} from 'app/api/auth/[...nextauth]/route';

/**
 * Interact with the LiveBlocksManager on the server in response to client or direct method calls
 * Calls the LiveBlocksManager if authenticated with next-auth
 * ROOM = DOCUMENT = PAGE
 */
export class ServerDocumentManager {
  private liveBlocksManager = new LiveBlocksManager();

  // DOCUMENTS
  /**
   * Get a document.
   * Only allow if user has access to room (including logged-out users and public rooms).
   *

   * @param documentId - The document id
   */
  public async getDocument({documentId}: GetDocumentProps): Promise<FetchApiResult<Document>> {
    const session = await getServerSession(authOptions);
    if (!documentId) {
      return {
        error: {
          code: 404,
          message: 'Pls supply a documentId',
          suggestion: "Check that you're on the correct page",
        },
      };
    }
    // Get session and room
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});

    const {data, error} = room;

    if (error) {
      return {error};
    }

    if (!data) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // Check current user has access to the room (if not logged in, use empty values)
    if (
      !userAllowedInRoom({
        accessesAllowed: [RoomAccess.RoomWrite, RoomAccess.RoomRead],
        userId: session?.user?.id ?? '',
        projectIds: session?.user?.projectIds ?? [],
        room: data,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to the room",
        },
      };
    }

    // Convert room into our custom document format and return
    const document: Document = buildDocument(data);
    return {data: document};
  }

  /**
   * Get a list of documents.
   * Filter by sending userId, projectIds, or metadata in the query, otherwise return all.
   * Only allow if authorized with NextAuth and user has access to each room.
   *

   * @param [userId] - Optional, filter to rooms with this userAccess set
   * @param [projectIds] - Optional, filter to rooms with these projectIds set (comma separated)
   * @param [documentType] - Optional, filter for this type of document e.g. "canvas"
   * @param [drafts] - Optional, retrieve only draft documents
   * @param [limit] - Optional, the amount of documents to retrieve
   */
  public async getDocuments({userId = '', projectIds = [], documentType, drafts, limit}: GetDocumentsProps) {
    // Build getRooms arguments
    const metadata: RoomMetadata = {};

    if (documentType) {
      metadata['type'] = documentType;
    }

    let getRoomsOptions: Parameters<typeof this.liveBlocksManager.getRooms>[0] = {
      limit,
      metadata,
    };

    const draftGroupName = getDraftsGroupName(userId);

    if (drafts) {
      // Drafts are stored as a group that uses the userId
      getRoomsOptions = {
        ...getRoomsOptions,
        projectIds: [draftGroupName],
      };
    } else {
      // Not a draft, use other info
      getRoomsOptions = {
        ...getRoomsOptions,
        projectIds: projectIds.filter((id) => id !== draftGroupName),
        userId: userId,
      };
    }

    // Get session and rooms
    const session = await getServerSession(authOptions);
    const rooms = await this.liveBlocksManager.getRooms(getRoomsOptions);

    // Check user is logged in
    if (!session) {
      return {
        error: {
          code: 401,
          message: 'Not signed in',
          suggestion: 'Sign in to get documents',
        },
      };
    }

    // Call Liveblocks API and get rooms
    const {data, error} = rooms;

    if (error || !data) {
      return {error};
    }

    // Check current logged-in user has access to each room
    if (
      !userAllowedInRooms({
        accessesAllowed: [RoomAccess.RoomWrite, RoomAccess.RoomRead],
        userId: session.user.id as string,
        projectIds: projectIds,
        rooms: data.data,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to the document",
        },
      };
    }

    // Convert rooms to custom document format
    const documents = buildDocuments(data.data ?? []);

    const result: GetDocumentsResponse = {
      documents: documents,
      nextPage: data.nextPage,
    };

    return {data: result};
  }

  /**
   * Get the next rooms from the next param
   * The `next` param is retrieved from /pages/api/documents/index.ts
   * That API is called on the client within /lib/client/getDocumentsByGroup.ts
   * Only allow if authorized with NextAuth and user has access to each room.
   *

   * @param nextPage - String containing a URL to get the next set of rooms, returned from Liveblocks API
   */
  public async getNextDocuments({nextPage}: GetNextDocumentsProps): Promise<FetchApiResult<GetDocumentsResponse>> {
    // Get session and next rooms
    const session = await getServerSession(authOptions);
    const nextRooms = await this.liveBlocksManager.getNextRoom({next: decode(nextPage)});
    // Check user is logged in
    if (!session) {
      return {
        error: {
          code: 401,
          message: 'Not signed in',
          suggestion: 'Sign in to get documents',
        },
      };
    }

    // Get list of next rooms
    const {data, error} = nextRooms;

    if (error) {
      return {error};
    }

    if (!data) {
      return {
        error: {
          code: 404,
          message: 'No more rooms found',
          suggestion: 'No more rooms to paginate',
        },
      };
    }

    // Check current logged-in user has access to each room
    if (
      !userAllowedInRooms({
        accessesAllowed: [RoomAccess.RoomWrite, RoomAccess.RoomRead],
        userId: session.user?.id,
        projectIds: session.user?.projectIds!,
        rooms: data.data,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to the document",
        },
      };
    }

    // Convert to our document format and return
    const documents = buildDocuments(data.data);

    const result: GetDocumentsResponse = {
      documents: documents,
      nextPage: data.nextPage,
    };
    return {data: result};
  }

  /**
   * Create Document
   *
   * Create a new document, with a specified name and type, from userId and projectId
   *
   * @param name - The name of the new document
   * @param type - The type of the new document e.g. "canvas"
   * @param userId - The user creating the document
   * @param [projectIds] - The new document's initial groups
   * @param [draft] - If the document is a draft (no public or group access, but can invite)

   */
  public async createDocument({
    name,
    type,
    userId,
    projectIds,
    draft,
  }: CreateDocumentProps): Promise<FetchApiResult<Document>> {
    const id = nanoid();

    // Custom metadata for our document
    const metadata: DocumentRoomMetadata = {
      name: name,
      type: type,
      owner: userId,
      draft: draft ? 'yes' : 'no',
    };

    // Give creator of document full access
    const usersAccesses: RoomAccesses = {
      [userId]: [RoomAccess.RoomWrite],
    };

    const groupsAccesses: RoomAccesses = {};

    if (draft) {
      // If draft, only add draft group access
      groupsAccesses[getDraftsGroupName(userId)] = [RoomAccess.RoomWrite];
    } else if (projectIds) {
      // If projectIds sent, limit access to these groups
      projectIds.forEach((projectId: string) => {
        groupsAccesses[projectId] = [RoomAccess.RoomWrite];
      });
    }

    // Calling Liveblocks API with required info
    const {data, error} = await this.liveBlocksManager.createRoom({
      id,
      metadata,
      usersAccesses,
      groupsAccesses,
    });

    if (error || !data) {
      return {error};
    }

    // Build createRoom result into our custom document format and return
    const document: Document = buildDocument(data);
    return {data: document};
  }

  /**
   * Update a document with new data
   * Only allow if user has access to room (including logged-out users and public rooms).
   * Do not allow if public access, or access granted through projectIds
   *

   * @param documentId - The document id
   * @param documentData - Data to update in the document
   */
  public async updateDocument({documentId, documentData}: UpdateDocumentProps): Promise<FetchApiResult<Document>> {
    // Get session and room
    const session = await getServerSession(authOptions);
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});

    // Check user is logged in
    if (!session) {
      return {
        error: {
          code: 401,
          message: 'Not signed in',
          suggestion: 'Sign in to get rooms information',
        },
      };
    }

    // Get the room to update
    const {data, error} = room;

    if (error) {
      return {error};
    }

    if (!data) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // Check current logged-in user has access to the room
    if (
      !userAllowedInRoom({
        accessesAllowed: [RoomAccess.RoomWrite],
        userId: session.user?.id,
        projectIds: session.user?.projectIds!,
        room: data,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to the document",
        },
      };
    }

    // If successful, update room with new data
    const {data: updatedRoomData, error: updatedRoomError} = await this.liveBlocksManager.updateRoom({
      ...documentData,
      roomId: documentId,
    });

    if (updatedRoomError) {
      return {error: updatedRoomError};
    }

    if (!updatedRoomData) {
      return {
        error: {
          code: 404,
          message: 'Updated room not found',
          suggestion: 'Contact an administrator',
        },
      };
    }

    // If update successful, convert to custom document format and return
    const document: Document = buildDocument(updatedRoomData);
    return {data: document};
  }

  /**
   * Delete Document
   *
   * Delete a document
   * Only allow if authorized with NextAuth and is added as a userId on usersAccesses
   * Do not allow if public access, or access granted through projectIds
   *
   * @param documentId - The document to delete

   */
  public async deleteDocument({documentId}: DeleteDocumentProps): Promise<FetchApiResult<Document['id']>> {
    const session = await getServerSession(authOptions);
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});
    // Check the room `documentId` exists
    const {data: currentRoom, error} = room;

    if (error) {
      return {error};
    }

    if (!currentRoom) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // Check current logged-in user has edit access to the room
    if (
      !userAllowedInRoom({
        accessesAllowed: [RoomAccess.RoomWrite],
        checkAccessLevels: [RoomAccessLevels.USER],
        userId: session?.user?.id as string,
        projectIds: session?.user?.projectIds as string[],
        room: currentRoom,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to the document",
        },
      };
    }

    const {error: deleteRoomError} = await this.liveBlocksManager.deleteRoom({roomId: documentId});

    if (deleteRoomError) {
      return {error: deleteRoomError};
    }

    return {data: documentId};
  }

  // USERS & GROUPS
  /**
   * Get all collaborators in a given document.
   *

   * @param documentId - The document's id
   */
  public async getDocumentUsers({documentId}: GetDocumentUsersProps): Promise<FetchApiResult<DocumentUser[]>> {
    // Get session and room
    const session = await getServerSession(authOptions);
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});

    // Get the room from documentId
    const {data, error} = room;

    if (error) {
      return {error};
    }

    if (!data) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // If successful, convert room to a list of collaborators and send
    const result: DocumentUser[] = await buildDocumentUsers(data, session?.user?.id ?? '');
    return {data: result};
  }

  /**
   * Retrieve the current live users in documents
   * Select documents by posting an array of documentIds in the body
   * Only allow if authorized with NextAuth
   *

   * @param documentIds - A list of document ids to select
   */
  public async getLiveUsers({documentIds}: GetLiveUsersProps): Promise<FetchApiResult<LiveUsersResponse[]>> {
    // Get session and active users
    const session = await getServerSession(authOptions);
    const activeUsers = await this.liveBlocksManager.getActiveUsersInRooms({roomIds: documentIds});

    // Check user is logged in
    if (!session) {
      return {
        error: {
          code: 401,
          message: 'Not signed in',
          suggestion: 'Sign in to access active users',
        },
      };
    }

    // Check active users returned successfully
    const {data, error} = activeUsers;

    if (error) {
      return {error};
    }

    // If you'd like to filter which data about users is sent, do so here
    // Example - only name is sent as live user data:
    // data.forEach(room => room.users = room.users.map(
    //   (user: ActiveUser) => ({ name: user.info.name })
    // ))

    return {data};
  }

  /**
   * Get all groups attached to a given document.
   *
   * @param documentId - The document's id
   */
  public async getDocumentGroups({documentId}: GetDocumentGroupsProps): Promise<FetchApiResult<DocumentGroup[]>> {
    // Get session and room
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});

    // Get the room from documentId
    const {data, error} = room;

    if (error) {
      return {error};
    }

    if (!data) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // If successful, convert room to a list of groups and send
    const result: DocumentGroup[] = await buildProjects(data);
    return {data: result};
  }

  /**
   * Add a new group to a document, or edit an old group's permissions
   * Only allow if authorized with NextAuth and if user is added as a userId on usersAccesses
   * Do not allow if public access, or access granted through projectIds
   *

   * @param documentId - The document's id
   * @param projectId - The edit group's id
   * @param access - The invited user's new document access
   */
  public async updateGroupAccess({
    documentId,
    projectId,
    access,
  }: UpdateGroupAccessProps): Promise<FetchApiResult<DocumentGroup[]>> {
    // Get session, room, and group
    const session = await getServerSession(authOptions);
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});
    const group = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Check user is logged in
    if (!session) {
      return {
        error: {
          code: 401,
          message: 'Not signed in',
          suggestion: 'Sign in to update groups',
        },
      };
    }

    // Check the room `documentId` exists
    const {data, error} = room;

    if (error) {
      return {error};
    }

    if (!data) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // Check current logged-in user has edit access to the room
    if (
      !userAllowedInRoom({
        accessesAllowed: [RoomAccess.RoomWrite],
        checkAccessLevels: [RoomAccessLevels.USER],
        userId: session.user?.id,
        projectIds: session.user?.projectIds!,
        room: data,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to the room",
        },
      };
    }

    // Check group exists in system
    if (!group) {
      return {
        error: {
          code: 400,
          message: 'Group does not exist',
          suggestion: `Check that that group ${projectId} exists in the system`,
        },
      };
    }

    // If room exists, create userAccesses element for new collaborator with passed access level
    const groupsAccesses: RoomAccesses = {
      [projectId]: documentAccessToRoomAccesses(access),
    };

    // If draft and adding a group, remove drafts group
    const draftGroupId = getDraftsGroupName(session.user?.id);
    if (projectId !== draftGroupId && draftGroupId in data.groupsAccesses) {
      groupsAccesses[draftGroupId] = null;
    }

    // Update the room with the new collaborators
    const {data: updatedRoom, error: updateRoomError} = await this.liveBlocksManager.updateRoom({
      roomId: documentId,
      groupsAccesses: groupsAccesses,
    });

    if (updateRoomError) {
      return {error: updateRoomError};
    }

    if (!updatedRoom) {
      return {
        error: {
          code: 404,
          message: 'Updated room not found',
          suggestion: 'Contact an administrator',
        },
      };
    }

    // If successful, convert room to a list of groups and send
    const result: DocumentGroup[] = await buildProjects(updatedRoom);
    return {data: result};
  }

  /**
   * Remove a group from a document
   * Only allow if authorized with NextAuth and is added as a userId on usersAccesses
   * Do not allow if public access, or access granted through projectIds
   *

   * @param documentId - The document's id
   * @param projectId - The removed group's id
   */
  public async removeGroupAccess({
    documentId,
    projectId,
  }: RemoveGroupAccessProps): Promise<FetchApiResult<DocumentGroup[]>> {
    // Get session, room, and group
    const session = await getServerSession(authOptions);
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});
    const group = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Check user is logged in
    if (!session) {
      return {
        error: {
          code: 401,
          message: 'Not signed in',
          suggestion: 'Sign in to delete groups',
        },
      };
    }

    // Check the room `documentId` exists
    const {data, error} = room;

    if (error) {
      return {error};
    }

    if (!data) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // Check current logged-in user is set as a user with id, ignoring projectIds and default access
    if (
      !userAllowedInRoom({
        accessesAllowed: [RoomAccess.RoomWrite],
        checkAccessLevels: [RoomAccessLevels.USER],
        userId: session.user?.id,
        projectIds: [],
        room: data,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to remove groups from the room",
        },
      };
    }

    // Check group exists in system
    if (!group) {
      return {
        error: {
          code: 400,
          message: 'Group does not exist',
          suggestion: `Check that that group ${projectId} exists in the system`,
        },
      };
    }

    // If room exists, create groupsAccess element for removing the current group
    const groupsAccesses = {
      [projectId]: null,
    };

    // Update the room with the new group
    const {data: updatedRoom, error: updateRoomError} = await this.liveBlocksManager.updateRoom({
      roomId: documentId,
      groupsAccesses: groupsAccesses,
    });

    if (updateRoomError) {
      return {error: updateRoomError};
    }

    if (!updatedRoom) {
      return {
        error: {
          code: 404,
          message: 'Updated group not found',
          suggestion: 'Contact an administrator',
        },
      };
    }

    // If successful, convert room to a list of groups and send
    const result: DocumentGroup[] = await buildProjects(updatedRoom);
    return {data: result};
  }

  /**
   * Remove a collaborator from a document
   * Only allow if authorized with NextAuth and is added as a userId on usersAccesses
   * Do not allow if public access, or access granted through projectIds
   *

   * @param documentId - The document's id
   * @param userId - The removed user's id
   */
  public async removeUserAccess({documentId, userId}: RemoveUserAccessProps): Promise<FetchApiResult<DocumentUser[]>> {
    // Get session, room, and group
    const session = await getServerSession(authOptions);
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // Check user is logged in
    if (!session) {
      return {
        error: {
          code: 401,
          message: 'Not signed in',
          suggestion: 'Sign in to remove a user',
        },
      };
    }

    // Check the room `documentId` exists
    const {data: currentRoom, error} = room;

    if (error) {
      return {error};
    }

    if (!currentRoom) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // Check current logged-in user is set as a user with id, ignoring projectIds and default access
    if (
      !userAllowedInRoom({
        accessesAllowed: [RoomAccess.RoomWrite],
        checkAccessLevels: [RoomAccessLevels.USER],
        userId: session.user?.id,
        projectIds: [],
        room: currentRoom,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to the document",
        },
      };
    }

    // Check user exists in system
    if (!user) {
      return {
        error: {
          code: 400,
          message: 'User not found',
          suggestion: "Check that you've used the correct user id",
        },
      };
    }

    // If user exists, check that they are not the owner
    if (isUserDocumentOwner({room: currentRoom, userId: userId})) {
      return {
        error: {
          code: 400,
          message: 'User is owner',
          suggestion: `User ${userId} is the document owner and cannot be edited`,
        },
      };
    }

    // If room exists, create userAccess element for removing the current collaborator
    const usersAccesses = {
      [userId]: null,
    };

    // Update the room with the new collaborators
    const {data: updatedRoom, error: updateRoomError} = await this.liveBlocksManager.updateRoom({
      roomId: documentId,
      usersAccesses: usersAccesses,
    });

    if (updateRoomError) {
      return {error: updateRoomError};
    }

    if (!updatedRoom) {
      return {
        error: {
          code: 404,
          message: 'Updated room not found',
          suggestion: 'Contact an administrator',
        },
      };
    }

    const result: DocumentUser[] = await buildDocumentUsers(updatedRoom, session.user?.id);
    return {data: result};
  }

  /**
   * POST Default access - used in /lib/client/updateDocumentScope.ts
   *
   * Update the default access for a document to public or private
   *

   * @param documentId - The document's id
   * @param access - The new default access: "public" or "private"
   */
  public async updateDefaultAccess({documentId, access}: UpdateDefaultAccessProps): Promise<FetchApiResult<Document>> {
    // Get session and room
    const session = await getServerSession(authOptions);
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});

    // Check user is logged in
    if (!session) {
      return {
        error: {
          code: 401,
          message: 'Not signed in',
          suggestion: 'Sign in to update public access level',
        },
      };
    }

    // Check the room exists
    const {data, error} = room;

    if (error) {
      return {error};
    }

    if (!data) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // Check current logged-in user has access to the room
    if (
      !userAllowedInRoom({
        accessesAllowed: [RoomAccess.RoomWrite],
        userId: session.user?.id,
        projectIds: session.user?.projectIds!,
        room: data,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to the room",
        },
      };
    }

    // If room exists, create default access parameter for room
    const defaultAccesses = documentAccessToRoomAccesses(access);

    // Update the room with the new default access
    const {data: updatedRoom, error: updateRoomError} = await this.liveBlocksManager.updateRoom({
      roomId: documentId,
      defaultAccesses: defaultAccesses,
    });

    if (updateRoomError) {
      return {error: updateRoomError};
    }

    if (!updatedRoom) {
      return {
        error: {
          code: 404,
          message: 'Updated room not found',
          suggestion: 'Contact an administrator',
        },
      };
    }

    // If successful, covert to custom document format and return
    const document: Document = buildDocument(updatedRoom);
    return {data: document};
  }

  /**
   * Add a new collaborator to a document, or edit an old collaborator
   * Only allow if authorized with NextAuth and is added as a userId on usersAccesses
   * Do not allow if public access, or access granted through projectIds
   *

   * @param documentId - The document's id
   * @param userId - The id of the user we're updating
   * @param access - The user's new document access level
   */
  public async updateUserAccess({
    documentId,
    userId,
    access,
  }: UpdateUserAccessProps): Promise<FetchApiResult<DocumentUser[]>> {
    // Get session and room
    const session = await getServerSession(authOptions);
    const room = await this.liveBlocksManager.getRoom({roomId: documentId});
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // Check user is logged in
    if (!session) {
      return {
        error: {
          code: 401,
          message: 'Not signed in',
          suggestion: 'Sign in to update document users',
        },
      };
    }

    // Check the room `documentId` exists
    const {data: currentRoom, error} = room;

    if (error) {
      return {error};
    }

    if (!currentRoom) {
      return {
        error: {
          code: 404,
          message: 'Room not found',
          suggestion: "Check that you're on the correct page",
        },
      };
    }

    // Check current logged-in user has edit access to the room
    if (
      !userAllowedInRoom({
        accessesAllowed: [RoomAccess.RoomWrite],
        checkAccessLevels: [RoomAccessLevels.USER],
        userId: session.user?.id,
        projectIds: session.user?.projectIds!,
        room: currentRoom,
      })
    ) {
      return {
        error: {
          code: 403,
          message: 'Not allowed access',
          suggestion: "Check that you've been given permission to the document",
        },
      };
    }

    // Check user exists in system
    if (!user) {
      return {
        error: {
          code: 200,
          message: 'User not found',
          suggestion: "Check that you've used the correct user id",
        },
      };
    }

    // If user exists, check that they are not the owner
    if (isUserDocumentOwner({room: currentRoom, userId: userId})) {
      return {
        error: {
          code: 400,
          message: 'User is owner',
          suggestion: `User ${userId} is the document owner and cannot be edited`,
        },
      };
    }

    // If room exists, create userAccesses element for new collaborator with passed access level
    const usersAccesses = {
      [userId]: documentAccessToRoomAccesses(access),
    };

    // Update the room with the new collaborators
    const {data: updatedRoom, error: updateRoomError} = await this.liveBlocksManager.updateRoom({
      roomId: documentId,
      usersAccesses: usersAccesses,
    });

    if (updateRoomError) {
      return {error: updateRoomError};
    }

    if (!updatedRoom) {
      return {
        error: {
          code: 404,
          message: 'Updated room not found',
          suggestion: 'Contact an administrator',
        },
      };
    }

    // Send email to user notifying that they've been added or their permission has been changed
    const updatedDocument: Document = buildDocument(updatedRoom);
    // const documentUrl = `${req.headers.origin}${DOCUMENT_URL(updatedDocument.type, updatedDocument.id)}`;
    // const documentUrl = `${req.headers.origin}${DOCUMENT_URL(updatedDocument.type, updatedDocument.id)}`;

    // If update successful, return the new list of collaborators
    const result: DocumentUser[] = await buildDocumentUsers(updatedRoom, session.user?.id);
    return {data: result};
  }
}
