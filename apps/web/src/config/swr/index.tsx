import { fetcher } from 'lib/client';

const handleOnError = (error) => {
  throw new Error(`Error: ${error}`);
};

const swrConfig = () => ({
  fetcher,
  onError: handleOnError,
  refreshInterval: 30000,
});

export default swrConfig;
