import toast from 'react-hot-toast';
import {webTypes} from 'types';

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
  setLoading(true);
  const {body, headers, ...opts} = options;
  let requestBody;
  if (upload) {
    requestBody = body;
  } else {
    requestBody = JSON.stringify(body);
  }
  const header = upload ? {'Content-Length': requestBody.size} : {'Content-Type': 'application/json'};

  try {
    const res = await fetch(url, {
      body: requestBody,
      headers: {
        ...header,
        ...headers,
      },
      ...opts,
    });
    const data = await res.json();
    const response = {status: res.status, ...data, url};
    setLoading(false);

    if (response.errors) {
      onError(response.status);
      if (!silentFail) {
        Object.keys(response.errors).forEach((error) => toast.error(response.errors[error].msg));
      }
    } else {
      if (!returnData) {
        onSuccess(response.data);
        if (successMsg) {
          toast.success(successMsg);
        }
      } else {
        return response.data;
      }
    }
  } catch (error) {
    console.log({error});
  }
}

export default api;
