import { Product } from './types';

export function money(value: number) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(value);
}

export function salePrice(product: Product) {
  return Number((product.price * (1 - product.discountPercent / 100)).toFixed(2));
}

export function apiError(error: any) {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message[0];
  return message || error?.message || 'Something went wrong';
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
