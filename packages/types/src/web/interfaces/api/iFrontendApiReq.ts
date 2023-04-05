export interface IFrontendApiReq {
  url: string;
  options: any;
  setLoading?: (loading?: boolean) => void;
  onError?: (status: number) => void | null;
  onSuccess?: (data: any) => void | null;
  successMsg?: string;
  upload?: boolean;
}
