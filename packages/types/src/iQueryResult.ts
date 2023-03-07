export interface IQueryResult<T> {
  results: T[];
  numberOfItems: number;
  page: number;
  itemsPerPage: number;
}
