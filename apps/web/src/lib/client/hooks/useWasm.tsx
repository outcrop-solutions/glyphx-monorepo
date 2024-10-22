import {useEffect} from 'react';
// Enum for event types
enum EVENTS {
  SELECTED_GLYPHS = 'SELECTED_GLYPHS',
  SCREENSHOT_TAKEN = 'SCREENSHOT_TAKEN',
}

/**
 * This is necessarily to setup our callbacks on an event by event basis given that all the evennt names are "model-event"
 * @param callbacks
 */
const useWasm = (eventName: string, callback: any) => {
  useEffect(() => {
    const handleEvent = (event) => {
      console.log({event});
      // Iterate through each event type and check for the matching key in event.detail
      callback(event.detail);
    };

    // Register the event listener
    window.addEventListener(eventName, handleEvent);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener(eventName, handleEvent);
    };
  }, [callback, eventName]);
};

export default useWasm;
