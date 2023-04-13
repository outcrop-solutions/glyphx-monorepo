import { useRouter } from 'next/router';

/**
 * Returns base url based on environment
 * @returns {string}
 */
const useUrl = () => {
  const router = useRouter();
  const { asPath } = router;
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const URL = `${origin}${asPath}`;
  const parts = URL.split('/');
  return parts.slice(0, 3).join('/');
};

export default useUrl;
