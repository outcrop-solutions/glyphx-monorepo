'use client';
import {useState, useEffect, useRef} from 'react';
import {QWebChannel} from 'qwebchannel';
import {useSetRecoilState} from 'recoil';
import {cameraAtom, imageHashAtom, pageNumberAtom, rowIdsAtom} from 'state';
import {webTypes} from 'types';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {debounce} from 'lodash';

export const useSocket = () => {
  const [channel, setChannel] = useState(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setPageNumber = useSetRecoilState(pageNumberAtom);
  const setImage = useSetRecoilState(imageHashAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const isMounted = useRef(false); // Ref to track component mount status
  const payload = useRef({isSent: false}); // Using useRef to persist payload across renders

  const setRows = debounce((rowIds) => {
    setRowIds(rowIds);
  }, 250);

  useEffect(() => {
    try {
      isMounted.current = true;

      if (!channel && !socket) {
        const ws = new WebSocket('ws://localhost:63630');

        ws.onopen = () => {
          try {
            console.info('socket opened cleanly');
            if (!isMounted.current) return;
            const channel = new QWebChannel(ws, (channel) => {
              window.core = channel.objects.core; // making it global
              window.core.SendRowIds.connect((json: string) => {
                const ids = JSON.parse(json)?.rowIds;
                const rowIds = ids.length === 0 ? false : [...ids];
                setPageNumber(0);
                setRows(rowIds);
              });
              window.core.SendCameraPosition.connect((json: string) => {
                const jsonCamera = `{${json}}`;
                const {camera} = JSON.parse(jsonCamera);
                console.log('camera in socket', {camera});
                const newCamera: webTypes.Camera = {
                  pos: {
                    x: camera.position[0],
                    y: camera.position[1],
                    z: camera.position[2],
                  },
                  dir: {
                    x: camera.direction[0],
                    y: camera.direction[1],
                    z: camera.direction[2],
                  },
                  center: {
                    x: camera.center[0],
                    y: camera.center[1],
                    z: camera.center[2],
                  },
                };
                setCamera(
                  produce((draft: WritableDraft<webTypes.Camera>) => {
                    draft.pos = {x: newCamera.pos.x, y: newCamera.pos.y, z: newCamera.pos.z};
                    draft.dir = {x: newCamera.dir.x, y: newCamera.dir.y, z: newCamera.dir.z};
                    draft.center = {x: newCamera.center!.x, y: newCamera.center!.y, z: newCamera.center!.z};
                  })
                );
              });
              window.core.SendScreenShot.connect((json: string) => {
                const imageHash = JSON.parse(json);
                console.log('send screenshot in socket', {imageHash});
                setImage(
                  produce((draft: WritableDraft<webTypes.ImageHash>) => {
                    draft.imageHash = imageHash.imageData;
                  })
                );
              });
              window.core.OpenProjectComplete.connect((json: string) => {
                const msg = JSON.parse(json);
                console.log('open project complete', {msg, isSent: payload.current.isSent});
                if (!payload.current.isSent && msg.isCreate) {
                  console.log({msg, isSent: payload.current.isSent});
                  console.log('set isSet to true');
                  console.log('state snapshot taken', {msg});
                  payload.current.isSent = true;
                  window?.core?.GetCameraPosition(true);
                  window?.core?.TakeScreenShot('');
                }
              });
            });
            setChannel(channel);
          } catch (error) {}
        };

        ws.onerror = (error) => {
          console.error({error});
        };

        ws.onclose = (event) => {
          try {
            if (event.wasClean) {
              console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
              console.warn(`Connection died, code=${event.code}, reason=${event.reason}`, {event});
              // TODO: Implement a reconnect mechanism here if needed
            }
          } catch (error) {}
        };

        ws.onmessage = (event) => {
          try {
            console.info({event});
          } catch (error) {}
        };

        setSocket(ws);
      }

      return () => {
        try {
          isMounted.current = false;
          if (socket && socket.readyState === WebSocket.OPEN) {
          }
        } catch (error) {}
      };
    } catch (error) {
      console.log({error});
    }
    // Using channel and socket in dependency array to clarify that the effect
    // should run when either of them changes, even if the core logic only runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, socket]);
};
