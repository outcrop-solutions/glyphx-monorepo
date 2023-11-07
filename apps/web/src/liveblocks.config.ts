'use client';
import {LiveMap, LiveObject, createClient} from '@liveblocks/client';
import {createRoomContext} from '@liveblocks/react';
import '@liveblocks/core';
import {User} from 'def/next-auth';
// The location of the liveblocks custom API endpoints
export const ENDPOINT_BASE_URL = '/api/liveblocks';

// Creating client with a custom callback that calls our API
// In this API we'll assign each user custom data, such as names, avatars
// If any client side data is needed to get user info from your system,
// (e.g. auth token, user id) send it in the body alongside `room`.
// Check inside `/pages/${ENDPOINT_BASE_URL}/auth` for the endpoint
const client = createClient({
  authEndpoint: async (roomId: string) => {
    const payload = {
      roomId,
    };

    // Call auth API route to get Liveblocks access token
    const response = await fetch(ENDPOINT_BASE_URL + '/liveblocks-auth', {
      method: 'POST',
      headers: {
        Authentication: 'token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    // If auth not successful, add stringified error object to current URL params
    if (!response.ok) {
      return;
    }

    // Return token
    return result;
  },
});

// Presence represents the properties that will exist on every User in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
export type Presence = {
  cursor: {x: number; y: number} | null;
};

export type Note = LiveObject<{
  x: number;
  y: number;
  text: string;
  selectedBy: UserMeta['info'] | null;
  id: string;
}>;

// this is what we will use to store "charms" on models
export type Notes = LiveMap<string, Note>;

// Optionally, Storage represents the shared document that persists in the
// Room, even after all Users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  notes: Notes;
};

// the shape that communicates with liveblocks user registry
export type UserInfo = Pick<User, 'name' | 'image' | 'color' | 'email' | 'projectIds'>;

// Optionally, UserMeta represents static/readonly metadata on each User, as
// provided by your own custom auth backend (if used). Useful for data that
// will not change during a session, like a User's name or avatar.

// the shape that the user document has when coming from the liveblocks api
export type UserMeta = {
  info: {
    name: string | undefined; // to make UserMeta happy
    image: UserInfo['image'];
    color: UserInfo['color'];
    email: UserInfo['email'];
    projectIds?: UserInfo['projectIds'];
  };
};

// Optionally, the type of custom events broadcasted and listened for in this
// room. Must be JSON-serializable.
type RoomEvent = {
  type: 'SHARE_DIALOG_UPDATE';
};

export const {
  suspense: {
    RoomProvider,
    useBroadcastEvent,
    useEventListener,
    useHistory,
    useCanUndo,
    useCanRedo,
    useMutation,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useRoom,
    useSelf,
    useStorage,
    useMyPresence,
    useUpdateMyPresence,
  },
  /* ...all the other hooks you’re using... */
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);
