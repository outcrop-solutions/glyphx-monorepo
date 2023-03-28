export interface IFetchConfig {
  url: string;
  options: any;
  successMsg: string;
}

export interface IFrontendApiReq {
  url: string;
  options: any;
  setLoading?: (loading?: boolean) => void;
  onError?: (status: number) => void | null;
  onSuccess?: (data: any) => void | null;
  successMsg?: string;
}
