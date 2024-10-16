import {useEffect} from 'react';
// Enum for event types
enum EVENTS {
  SELECTED_GLYPHS = 'SELECTED_GLYPHS',
  SCREENSHOT_TAKEN = 'SCREENSHOT_TAKEN',
}
// Map the event details keys to their respective event types
const props = {
  [`${EVENTS.SELECTED_GLYPHS}`]: 'SelectedGlyphs',
  [`${EVENTS.SCREENSHOT_TAKEN}`]: 'ScreenShotTaken',
};
/**
 * This is necessarily to setup our callbacks on an event by event basis given that all the evennt names are "model-event"
 * @param callbacks
 */
const useWasm = (callbacks: Map<EVENTS, (detail: any) => void>) => {
  useEffect(() => {
    const handleEvent = (event) => {
      // Iterate through each event type and check for the matching key in event.detail
      callbacks.forEach((callback, eventType) => {
        const key = props[eventType];
        if (event.detail && event.detail[key]) {
          callback(event.detail[key]);
        }
      });
    };

    // Register the event listener
    window.addEventListener('model-event', handleEvent);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('model-event', handleEvent);
    };
  }, [callbacks]);
};

export default useWasm;
