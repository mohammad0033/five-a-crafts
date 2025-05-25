export interface Color {
  id: string | number; // Or just 'name' if IDs aren't used/returned by API
  name: string;
  hexCode?: string; // Optional: if your API provides it
  // any other relevant properties
}
