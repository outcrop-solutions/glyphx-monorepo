/**
 * Wrapper on the fetch api for use with SWR 
 * @alpha
 * @param input 
 * @param init 
 * @returns {Response}
 */

export async function fetcher<JSON = any>(input: RequestInfo, init?: RequestInit): Promise<JSON> {
  const response = await fetch(input, init);
  return response.json();
}

export default fetcher;
