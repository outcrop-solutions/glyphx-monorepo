import { usePathname } from 'next/navigation';

/**
 * Returns base url based on environment
 * @returns {string}
 */
const useUrl = () => {
  const pathname = usePathname();
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const URL = `${origin}${pathname}`;
  const parts = URL.split('/');
  return parts.slice(0, 3).join('/');
};

export default useUrl;
