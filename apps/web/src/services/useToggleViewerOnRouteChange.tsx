import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

const useToggleViewerOnRouteChange = () => {
  const router = useRouter();

  // close viewer on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window?.core?.ToggleDrawer(false);
    };
  }, [router]);
};

export default useToggleViewerOnRouteChange;
