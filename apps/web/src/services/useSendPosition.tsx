import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { viewerPositionAtom } from 'state';

export const useSendPosition = () => {
  const viewer = useRecoilValue(viewerPositionAtom);
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
