import {AuthData} from './auth-data';
import {SuccessRegister} from './success-register';

export interface AuthResponse {
  status: boolean;
  message: string;
  data?: AuthData | SuccessRegister; // Make data optional in case of error responses
}
