import { useState, useEffect } from 'react';
import { QWebChannel } from 'qwebchannel';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { cameraAtom, imageHashAtom, rowIdsAtom } from 'state';
import { web as webTypes } from '@glyphx/types';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
/**
 * To handle Socket Connection and Communications with Qt window
 * @param {boolean} isSelected
 * @returns {Object}
 */
const payload = { isSent: false };

export const useSocket = () => {
  const [channel, setChannel] = useState(null);
  const [socket, setSocket] = useState(null);
  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setImage = useSetRecoilState(imageHashAtom);
  const setCamera = useSetRecoilState(cameraAtom);

  useEffect(() => {
    if (channel === null && socket === null) {
      const ws = new WebSocket('ws://localhost:63630'); // Replace with your WebSocket server URL and port
      ws.onopen = () => {
        const channel = new QWebChannel(ws, function (channel) {
          window.core = channel.objects.core; // making it global
          window.core.SendRowIds.connect((json: string) => {
            const ids = JSON.parse(json)?.rowIds;
            console.log({ ids });
            setRowIds(ids.length === 0 ? false : [...ids]);
          });
          window.core.SendCameraPosition.connect((json: string) => {
            const jsonCamera = `{${json}}`;
            const { camera } = JSON.parse(jsonCamera);
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
            };
            setCamera(
              produce((draft: WritableDraft<webTypes.Camera>) => {
                draft.pos = { x: newCamera.pos.x, y: newCamera.pos.y, z: newCamera.pos.z };
                draft.dir = { x: newCamera.dir.x, y: newCamera.dir.y, z: newCamera.dir.z };
              })
            );
          });
          window.core.SendScreenShot.connect((json: string) => {
            const imageHash = JSON.parse(json);
            setImage(
              produce((draft: WritableDraft<webTypes.ImageHash>) => {
                draft.imageHash = imageHash.imageData;
              })
            );
          });
          window.core.SendDrawerStatus.connect((status: string) => {
            console.log({ status });
          });
          window.core.OpenProjectComplete.connect((json: string) => {
            const msg = JSON.parse(json);
            if (!payload.isSent && msg.isCreate) {
              payload.isSent = true;
              window?.core?.GetCameraPosition(true);
              window?.core?.TakeScreenShot('');
            }
          });
        });
        setChannel(channel);
      };
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
      };
      setSocket(ws); // Store the WebSocket instance in state
    }
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, socket]);
};
