import { useState, useEffect } from 'react';
import { QWebChannel } from 'qwebchannel';
/**
 * To handle Socket Connection and Communications with Qt window
 * @param {boolean} isSelected
 * @returns {Object}
 */
export const useSocket = () => {
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    let ws;
    let webChannel;

    if (!channel) {
      const ws = new WebSocket('ws://localhost:12345'); // Replace with your WebSocket server URL and port
      ws.onopen = () => {
        webChannel = new QWebChannel(ws, function (channel) {
          window.core = channel.objects.core; // making it global
        });
        setChannel(webChannel);
      };
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
      };
    }
    return () => {
      if (webChannel?.reset) {
        webChannel.reset();
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [channel]);
};
