export interface SuccessRegister {
  email: string;
  phone_number: string;
  username: string;
  token: {
    access: string;
    refresh: string;
  };
}
