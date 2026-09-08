export type User = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  photo?: string | null;
  address?: string | null;
  city?: string | null;
  postcode?: string | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  discountPercent: number;
  stock: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  category: Category;
  createdAt: string;
};

export type CartItem = {
  id: number;
  quantity: number;
  product: Product;
};

export type CartSummary = {
  items: CartItem[];
  count: number;
  subtotal: number;
};

export type WishlistItem = {
  id: number;
  product: Product;
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  image?: string | null;
};

export type Order = {
  id: number;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'COD' | 'SSLCOMMERZ';
  paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  subtotal: number;
  shippingFee: number;
  total: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  note?: string | null;
  createdAt: string;
};
