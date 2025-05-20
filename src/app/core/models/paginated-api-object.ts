export interface PaginatedApiObject {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}
