import {fetcher} from '@glyphx/business';

const handleOnError = (error) => {
  throw new Error(`Error: ${error}`);
};

const swrConfig = () => ({
  fetcher,
  onError: handleOnError,
  refreshInterval: 1000,
});

export default swrConfig;
