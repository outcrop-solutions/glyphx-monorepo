import {UserInfo} from 'liveblocks.config';
import {
  // ROOM
  RoomActiveUser,
  Room,
  RoomAccesses,
  RoomMetadata,
  //   API SPECIFIC
  FetchApiResult,
  LiveUsersResponse,
  GetRoomsResponse,
  GetStorageResponse,
} from '../../types';
import {fetchLiveblocksApi} from './utils';

/**
 * Calls the Remote Liveblocks API
 * ROOM = DOCUMENT = PAGE
 */
export class LiveBlocksManager {
  /**
   * Authorize
   *
   * Authorize a user in your Liveblocks app. Used within liveblocks.config.ts
   * Uses Liveblocks API
   *
   * Similar to using `authorize` from `@liveblocks/node`:
   * https://liveblocks.io/docs/api-reference/liveblocks-node#authorize
   *
   * @param roomId - The current room's id
   * @param userId - The current user's id
   * @param projectIds - The current user's project ids
   * @param userInfo - The current user's user info
   */
  public async authorize({
    roomId,
    userId,
    projectIds,
    userInfo,
  }: {
    projectIds?: string[];
    roomId: Room['id'];
    userId?: string;
    userInfo?: UserInfo;
  }): Promise<FetchApiResult<{token: string}>> {
    const url = `/v2/rooms/${roomId}/authorize`;

    const payload = JSON.stringify({
      roomId,
      userId,
      projectIds,
      userInfo,
    });

    return fetchLiveblocksApi<{token: string}>(url, {
      method: 'POST',
      body: payload,
    });
  }

  /**
   * Get Rooms
   *
   * Get a list of rooms
   * Uses Liveblocks API
   *
   * @param limit - The amount of rooms to load, between 1 and 100, defaults to 20
   * @param startingAfter - A cursor used for pagination, get the value from the response of the previous page
   * @param userId - The id of the user to filter
   * @param projectIds - The group to filter
   * @param metadata - The metadata to filter
   */
  public async getRooms({
    limit,
    startingAfter,
    userId,
    projectIds,
    metadata,
  }: {
    projectIds?: string[] | string;
    limit?: number;
    metadata?: RoomMetadata;
    startingAfter?: string;
    userId?: string;
  }): Promise<FetchApiResult<GetRoomsResponse>> {
    let url = `/v2/rooms?`;

    if (limit) {
      url += `&limit=${limit}`;
    }

    if (startingAfter) {
      url += `&startingAfter=${startingAfter}`;
    }

    if (userId) {
      url += `&userId=${userId}`;
    }

    if (projectIds && projectIds.length > 0) {
      url += `&projectIds=${projectIds}`;
    }

    if (metadata) {
      Object.entries(metadata).forEach(([key, val]) => {
        url += `&metadata.${key}=${val}`;
      });
    }

    return fetchLiveblocksApi<GetRoomsResponse>(url);
  }

  /**
   * Get Room
   *
   * Get the room by the room's id
   * Uses Liveblocks API
   *
   * @param roomId - The id of the room
   */
  public async getRoom({roomId}: {roomId: string}): Promise<FetchApiResult<Room>> {
    const url = `/v2/rooms/${roomId}`;
    return fetchLiveblocksApi<Room>(url);
  }

  /**
   * Create Room
   *
   * Create a new room with a number of params.
   * Uses Liveblocks API
   *
   * @param id - The id of the room
   * @param metadata - The room's metadata
   * @param usersAccesses - Which users are allowed in the room
   * @param groupsAccesses - Which groups are allowed in the room
   * @param defaultAccesses - Default accesses for room
   */
  public async createRoom({
    id,
    metadata,
    usersAccesses,
    groupsAccesses,
    defaultAccesses = [],
  }: {
    defaultAccesses?: string[];
    groupsAccesses?: RoomAccesses;
    id: string;
    metadata?: RoomMetadata;
    usersAccesses?: RoomAccesses;
  }): Promise<FetchApiResult<Room>> {
    const url = '/v2/rooms';

    const payload = JSON.stringify({
      id,
      metadata,
      usersAccesses,
      groupsAccesses,
      defaultAccesses,
    });

    return fetchLiveblocksApi<Room>(url, {
      method: 'POST',
      body: payload,
    });
  }

  /**
   * Update Room
   *
   * Get the room by the room's id
   * Uses Liveblocks API
   *
   * @param roomId - The id/name of the room
   * @param metadata - The room's metadata object
   * @param usersAccesses - The room's user accesses
   * @param groupsAccesses - The room's group accesses
   * @param defaultAccesses - The default access value
   */
  public async updateRoom({
    roomId,
    metadata,
    usersAccesses,
    groupsAccesses,
    defaultAccesses,
  }: {
    defaultAccesses?: Room['defaultAccesses'];
    groupsAccesses?: Room['groupsAccesses'];
    metadata?: Room['metadata'];
    roomId: Room['id'];
    usersAccesses?: Room['usersAccesses'];
  }): Promise<FetchApiResult<Room>> {
    const url = `/v2/rooms/${roomId}`;

    let payload = {};

    if (metadata) {
      payload = {...payload, metadata};
    }

    if (usersAccesses) {
      payload = {...payload, usersAccesses};
    }

    if (groupsAccesses) {
      payload = {...payload, groupsAccesses};
    }

    if (defaultAccesses) {
      payload = {...payload, defaultAccesses};
    }

    return fetchLiveblocksApi<Room>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Delete Room
   *
   * Delete the room by the room's id
   * Uses Liveblocks API
   *
   * @param roomId - The id of the room
   */
  public async deleteRoom({roomId}: {roomId: string}): Promise<FetchApiResult<Room>> {
    const url = `/v2/rooms/${roomId}`;
    return fetchLiveblocksApi<Room>(url, {
      method: 'DELETE',
    });
  }

  /**
   * Initialize Storage
   *
   * Initialize a room's storage and return the value as a JS object
   * The room must already exist and have an empty storage
   * Uses Liveblocks API
   *
   * @param roomId - The id of the room
   * @param storage - The Liveblocks format storage object to initialize the storage
   */
  public async initializeStorage({
    roomId,
    storage,
  }: {
    roomId: string;
    storage?: Record<string, unknown>;
  }): Promise<FetchApiResult<GetStorageResponse>> {
    const url = `/v2/rooms/${roomId}/storage`;

    const payload = storage ? JSON.stringify(storage) : undefined;

    const {data, error} = await fetchLiveblocksApi<GetStorageResponse>(url, {
      method: 'POST',
      body: payload,
    });

    if (error) {
      return {error};
    }

    return {data: data ?? {}};
  }

  /**
   * Get Storage
   *
   * Get a room's storage as a JS object
   * Note that this returns an object using the Liveblocks data structure
   * Uses Liveblocks API
   *
   * @param roomId - The id of the room
   */
  public async getStorage({roomId}: {roomId: string}): Promise<FetchApiResult<GetStorageResponse>> {
    const url = `/v2/rooms/${roomId}/storage`;

    const {data, error} = await fetchLiveblocksApi<GetStorageResponse>(url);

    if (error) {
      return {error};
    }

    return {data: data ?? {}};
  }

  /**
   * Delete Storage
   *
   * Delete the storage by the room's id
   * Uses Liveblocks API
   *
   * @param roomId - The id of the room
   */
  public async deleteStorage({roomId}: {roomId: string}): Promise<FetchApiResult<Room>> {
    const url = `/v2/rooms/${roomId}/storage`;
    return fetchLiveblocksApi<Room>(url, {
      method: 'DELETE',
    });
  }

  /**
   * Get Active Users
   *
   * Get the active users in a room, given a roomId
   * Uses Liveblocks API
   *
   * @param roomId - The id of the room
   */
  public async getActiveUsers({roomId}: {roomId: string}): Promise<FetchApiResult<RoomActiveUser[]>> {
    const url = `/v2/rooms/${roomId}/active_users`;

    const {data, error} = await fetchLiveblocksApi<{data: RoomActiveUser[]}>(url);

    if (error) {
      return {error};
    }

    return {data: data?.data ?? []};
  }

  /**
   * Get Active Users in Rooms
   *
   * Get the active users in a list of rooms, given roomIds
   * Uses Liveblocks API
   *
   * @param roomId - The ids of the rooms
   */
  public async getActiveUsersInRooms({roomIds}: {roomIds: string[]}): Promise<FetchApiResult<LiveUsersResponse[]>> {
    const promises: Promise<FetchApiResult<RoomActiveUser[]>>[] = [];

    // Call Liveblocks API for each room
    for (const roomId of roomIds) {
      promises.push(this.getActiveUsers({roomId: roomId}));
    }

    const currentActiveUsers = await Promise.all(promises);
    const result: LiveUsersResponse[] = [];

    // Add active user info to list ready to return
    for (const [i, roomId] of roomIds.entries()) {
      const {data, error} = currentActiveUsers[i];

      if (error) {
        return {error};
      }

      const users = data ?? [];

      result.push({
        documentId: roomId,
        users: users,
      });
    }

    return {data: result};
  }

  /**
   * Get Next Rooms
   *
   * Get the next rooms from the next param
   * The `next` param is retrieved from /pages/api/documents/index.ts
   * That API is called on the client within /lib/client/getDocumentsByGroup.ts
   * Uses Liveblocks API
   *
   * @param next - String containing a URL to get the next set of rooms, returned from Liveblocks API
   */
  public async getNextRoom({next}: {next: string}): Promise<FetchApiResult<GetRoomsResponse>> {
    return fetchLiveblocksApi<GetRoomsResponse>(next);
  }
}
