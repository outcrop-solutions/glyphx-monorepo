import { useState, useEffect } from 'react';
import { QWebChannel } from 'qwebchannel';
import { useSetRecoilState } from 'recoil';
import { cameraAtom, rowIdsAtom } from 'state';
import { web as webTypes } from '@glyphx/types';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
/**
 * To handle Socket Connection and Communications with Qt window
 * @param {boolean} isSelected
 * @returns {Object}
 */
export const useSocket = () => {
  const [channel, setChannel] = useState(null);
  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setCamera = useSetRecoilState(cameraAtom);

  useEffect(() => {
    let ws;
    let webChannel;

    if (!channel) {
      const ws = new WebSocket('ws://localhost:12345'); // Replace with your WebSocket server URL and port
      ws.onopen = () => {
        webChannel = new QWebChannel(ws, function (channel) {
          window.core = channel.objects.core; // making it global
          window.core.SendRowIds.connect((rowIds: string) => {
            // @ts-ignore
            setRowIds([...JSON.parse(rowIds)?.rowIds]);
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
          window.core.SendDrawerStatus.connect((status: string) => {
            console.log({ status });
          });
        });
        setChannel(webChannel);
      };
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
      };
    }
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);
};
