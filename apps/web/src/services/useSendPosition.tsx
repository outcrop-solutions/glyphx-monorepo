import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { viewerPositionSelector } from 'state';

export const useSendPosition = () => {
  const viewer = useRecoilValue(viewerPositionSelector);
  useEffect(() => {
    try {
      if (viewer) {
        console.log({ viewer });
        window?.core?.SendDrawerPosition(
          JSON.stringify({
            ...viewer,
          })
        );
      }
    } catch (error) {
      console.log({ error });
    }
  }, [viewer]);
};
