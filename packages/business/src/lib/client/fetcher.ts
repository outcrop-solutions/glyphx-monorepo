export async function fetcher(url) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const response = await fetch(url);
  return response.json();
}
