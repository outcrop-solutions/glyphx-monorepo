import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { viewerPositionSelector } from 'state';

export const useSendPosition = () => {
  const viewer = useRecoilValue(viewerPositionSelector);

  console.log({ ...viewer });
  useEffect(() => {
    try {
      if (viewer) {
        window?.core?.SendDrawerPosition(
          JSON.stringify({
            ...viewer,
          })
        );
      }
    } catch (error) {}
  }, [viewer]);
};
