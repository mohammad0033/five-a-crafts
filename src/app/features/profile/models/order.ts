import {OrderProduct} from './order-product';

export interface Order {
  orderNumber: string; // Using this as the slug/identifier for fetching
  orderDate: string; // Add an order date
  total: number; // Changed to number
  status: 'delivered' | 'pending' | 'cancelled';
  products: OrderProduct[]; // Add the list of products
  shippingAddress?: string;
  paymentMethod?: string;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  totalCost?: number;
  deliveredOn?: string;
  cancelledOn?: string;
  // You might add shipping address, payment info summary, etc. here later
}
