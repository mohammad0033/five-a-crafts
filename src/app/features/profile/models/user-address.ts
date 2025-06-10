export interface UserAddress {
  id: string;
  title: string; // e.g., "Home", "Work"
  details: string; // e.g., "123 Main St, Anytown, USA"
  isDefault?: boolean; // Optional: to mark a default address
}
