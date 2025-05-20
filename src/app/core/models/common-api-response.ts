import {PaginatedApiObject} from './paginated-api-object';

export interface CommonApiResponse {
  status: boolean;
  filters?: {};
  message: string;
  data: {} | any[] | PaginatedApiObject;
}
