import { useState, useEffect } from 'react';
import { QWebChannel } from 'qwebchannel';
import { useSetRecoilState } from 'recoil';
import { rowIdsAtom } from 'state';
/**
 * To handle Socket Connection and Communications with Qt window
 * @param {boolean} isSelected
 * @returns {Object}
 */
export const useSocket = () => {
  const [channel, setChannel] = useState(null);
  const setRowIds = useSetRecoilState(rowIdsAtom);

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
            setRowIds([...Array.from(JSON.parse(rowIds)?.rowIds)]);
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
  }, [channel]);
};
