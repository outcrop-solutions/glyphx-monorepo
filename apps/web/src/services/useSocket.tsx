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
    if (!channel) {
      const ws = new WebSocket('ws://localhost:12345'); // Replace with your WebSocket server URL and port
      ws.onopen = () => {
        const webChannel = new QWebChannel(ws, function (channel) {
          window.core = channel.objects.core; // making it global
        });
        setChannel(webChannel);
      };
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log({ message });
      };
      return () => {
        ws.close();
      };
    } else {
      channel.close();
    }
  }, [channel]);
};
