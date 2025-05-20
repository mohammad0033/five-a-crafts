
//   "price": {
//   "currency": "EGP",
//     "excl_tax": 1000.0,
//     "incl_tax": 1000.0,
//     "tax": 0.0
// },
export interface Price {
  currency: string;
  excl_tax: number;
  incl_tax: number;
  tax: number;
}
