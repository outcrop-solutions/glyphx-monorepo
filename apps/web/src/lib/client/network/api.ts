import toast from 'react-hot-toast';
import { web as webTypes } from '@glyphx/types';

export async function api({
  url,
  options,
  setLoading = () => {},
  onError = () => {},
  onSuccess = () => {},
  successMsg,
  upload = false,
  silentFail = false,
  returnData = false,
}: webTypes.IFrontendApiReq) {
  console.log({
    api: true,
    url,
    options,
    onSuccess,
    successMsg,
    upload,
    silentFail,
  });
  setLoading(true);
  const { body, headers, ...opts } = options;
  let requestBody;
  if (upload) {
    requestBody = body;
  } else {
    console.log('request body');
    requestBody = JSON.stringify(body);
  }

  try {
    console.log('calling fetch');
    const res = await fetch(url, {
      body: requestBody,
      headers: {
        'Content-Type': upload ? 'text/csv' : 'application/json',
        ...headers,
      },
      ...opts,
    });
    console.log({ res });
    const data = await res.json();
    console.log({ data, api: true });
    const response = { status: res.status, ...data, url };
    setLoading(false);

    if (response.errors) {
      onError(response.status);
      if (!silentFail) {
        Object.keys(response.errors).forEach((error) => toast.error(response.errors[error].msg));
      }
    } else {
      if (!returnData) {
        onSuccess(response.data);
        toast.success(successMsg);
      } else {
        return response.data;
      }
    }
  } catch (error) {
    console.log({ error, api: true });
    if (!silentFail) {
      toast.error(error.msg);
    }
  }
}

export default api;
