export interface IFetchConfig {
  url: string;
  options: any;
  successMsg: string;
}

export interface IFrontendApiReq {
  url: string;
  options: any;
  setLoading: (loading?: boolean) => void;
  onError: (status: number) => void | null;
  onSuccess: (data: any) => void | null;
  errorMsg?: string;
  successMsg?: string;
}

export enum HTTP_METHOD {
  CONNECT = 'CONNECT',
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  TRACE = 'TRACE',
}
