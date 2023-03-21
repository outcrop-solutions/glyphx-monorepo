export async function fetcher(url: any) {
  const response = await fetch(url);
  return response.json();
}

export default fetcher;
