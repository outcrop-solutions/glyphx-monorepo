import toast from 'react-hot-toast';

interface api {
  url: string;
  options: any;
  setLoading: (loading?: boolean) => void;
  onError: (status) => void | null;
  onSuccess: (data) => void | null;
  errorMsg?: string;
  successMsg?: string;
}

export async function api({
  url,
  options,
  setLoading = () => {},
  onError = () => {},
  onSuccess = () => {},
  errorMsg,
  successMsg,
}: api) {
  // toggle loading state
  setLoading(true);

  // serialize input
  const { body, headers, ...opts } = options;
  const requestBody = JSON.stringify(body);

  try {
    // execute api req
    const res = await fetch(url, {
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...opts,
    });
    const data = await res.json();
    const response = { status: res.status, ...data, url };

    // toggle loading state
    setLoading(false);

    // give user feedback, execute callbacks
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
