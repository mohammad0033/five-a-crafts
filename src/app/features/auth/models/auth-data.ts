import {User} from './user';

export interface AuthData {
  access: string;
  refresh: string;
  expiry: any; // Or a more specific type like number (for timestamp) or string (for ISO date)
  user?: User; // Assuming the user object might also come in this data block
}
