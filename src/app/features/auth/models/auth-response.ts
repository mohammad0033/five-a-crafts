import {AuthData} from './auth-data';

export interface AuthResponse {
  status: boolean;
  message: string;
  data?: AuthData; // Make data optional in case of error responses
}
