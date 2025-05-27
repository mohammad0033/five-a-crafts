import {User} from './user';

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User; // Define a User interface
}
