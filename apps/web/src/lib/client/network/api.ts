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
}: webTypes.IFrontendApiReq) {
  setLoading(true);
  const { body, headers, ...opts } = options;
  let requestBody;
  if (upload) {
    requestBody = body;
  } else {
    requestBody = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, {
      body: requestBody,
      headers: {
        'Content-Type': upload ? 'text/csv' : 'application/json',
        ...headers,
      },
      ...opts,
    });
    const data = await res.json();
    const response = { status: res.status, ...data, url };
    setLoading(false);

    if (response.errors) {
      onError(response.status);
      Object.keys(response.errors).forEach((error) => toast.error(response.errors[error].msg));
    } else {
      onSuccess(response.data);
      toast.success(successMsg);
    }
  } catch (error) {
    toast.error(error.msg);
  }
}

export default api;
