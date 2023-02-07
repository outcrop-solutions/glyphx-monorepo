export async function api(url, options) {
  const {body, headers, ...opts} = options;
  const requestBody = JSON.stringify(body);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const response = await fetch(url, {
    body: requestBody,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...opts,
  });
  const result = await response.json();
  return {status: response.status, ...result, url};
}

export default api;
