'use client';
import {useState, useEffect, useRef} from 'react';
import {QWebChannel} from 'qwebchannel';
import {useSetRecoilState} from 'recoil';
import {cameraAtom, imageHashAtom, rowIdsAtom} from 'state';
import {webTypes} from 'types';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';

export const useSocket = () => {
  const [channel, setChannel] = useState(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setImage = useSetRecoilState(imageHashAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const isMounted = useRef(false); // Ref to track component mount status
  const payload = useRef({isSent: false}); // Using useRef to persist payload across renders

  useEffect(() => {
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
              setRowIds(ids.length === 0 ? false : [...ids]);
            });
            window.core.SendCameraPosition.connect((json: string) => {
              const jsonCamera = `{${json}}`;
              const {camera} = JSON.parse(jsonCamera);
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
                  draft.pos = {x: newCamera.pos.x, y: newCamera.pos.y, z: newCamera.pos.z};
                  draft.dir = {x: newCamera.dir.x, y: newCamera.dir.y, z: newCamera.dir.z};
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
            window.core.OpenProjectComplete.connect((json: string) => {
              const msg = JSON.parse(json);
              if (!payload.current.isSent && msg.isCreate) {
                payload.current.isSent = true;
                window?.core?.GetCameraPosition(true);
                window?.core?.TakeScreenShot('');
                console.log({payload, window});
              }
            });
          });

          setChannel(channel);
        } catch (error) {
          console.error({error});
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      ws.onclose = (event) => {
        if (event.wasClean) {
          console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
          console.warn('Connection died');
          // TODO: Implement a reconnect mechanism here if needed
        }
      };

      ws.onmessage = (event) => {
        try {
          console.log({event});
          // Handle the message if needed
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      setSocket(ws);
    }

    return () => {
      try {
        isMounted.current = false;
        if (socket && socket.readyState === WebSocket.OPEN) {
          // socket.close();
        }
      } catch (error) {
        console.error({error});
      }
    };

    // Using channel and socket in dependency array to clarify that the effect
    // should run when either of them changes, even if the core logic only runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, socket]);
};
// /**
//  * To handle Socket Connection and Communications with Qt window
//  * @param {boolean} isSelected
//  * @returns {Object}
//  */
// const payload = {isSent: false};

// export const useSocket = () => {
//   const [channel, setChannel] = useState(null);
//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const setRowIds = useSetRecoilState(rowIdsAtom);
//   const setImage = useSetRecoilState(imageHashAtom);
//   const setCamera = useSetRecoilState(cameraAtom);

//   useEffect(() => {
//     if (channel === null && socket === null) {
//       const ws = new WebSocket('ws://localhost:63630'); // Replace with your WebSocket server URL and port
//       ws.onopen = () => {
//         const channel = new QWebChannel(ws, (channel) => {
//           window.core = channel.objects.core; // making it global
//           window.core.SendRowIds.connect((json: string) => {
//             const ids = JSON.parse(json)?.rowIds;
//             setRowIds(ids.length === 0 ? false : [...ids]);
//           });
//           window.core.SendCameraPosition.connect((json: string) => {
//             const jsonCamera = `{${json}}`;
//             const {camera} = JSON.parse(jsonCamera);
//             const newCamera: webTypes.Camera = {
//               pos: {
//                 x: camera.position[0],
//                 y: camera.position[1],
//                 z: camera.position[2],
//               },
//               dir: {
//                 x: camera.direction[0],
//                 y: camera.direction[1],
//                 z: camera.direction[2],
//               },
//             };
//             setCamera(
//               produce((draft: WritableDraft<webTypes.Camera>) => {
//                 draft.pos = {x: newCamera.pos.x, y: newCamera.pos.y, z: newCamera.pos.z};
//                 draft.dir = {x: newCamera.dir.x, y: newCamera.dir.y, z: newCamera.dir.z};
//               })
//             );
//           });
//           window.core.SendScreenShot.connect((json: string) => {
//             const imageHash = JSON.parse(json);
//             setImage(
//               produce((draft: WritableDraft<webTypes.ImageHash>) => {
//                 draft.imageHash = imageHash.imageData;
//               })
//             );
//           });
//           window.core.SendDrawerStatus.connect((status: string) => {});
//           window.core.OpenProjectComplete.connect((json: string) => {
//             const msg = JSON.parse(json);
//             console.log({msg});
//             if (!payload.isSent && msg.isCreate) {
//               payload.isSent = true;
//               window?.core?.GetCameraPosition(true);
//               window?.core?.TakeScreenShot('');
//               console.log({payload, window});
//             }
//           });
//         });
//         setChannel(channel);
//       };
//       ws.onmessage = (event) => {
//         const message = JSON.parse(event.data);
//       };
//       setSocket(ws); // Store the WebSocket instance in state
//     }
//     return () => {
//       if (socket && socket.readyState === WebSocket.OPEN) {
//         console.log({closing: true});
//         socket.close();
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [channel, socket]);
// };
