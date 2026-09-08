'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/lib/types';
import { money, salePrice, apiError } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { show } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const price = salePrice(product);

  const needLogin = () => {
    show('Please login to use cart or wishlist', 'error');
    router.push('/login');
  };

  const addCart = async () => {
    if (!user) return needLogin();
    setBusy(true);
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      window.dispatchEvent(new Event('cart-updated'));
      show(`${product.name} added to cart`);
    } catch (e) { show(apiError(e), 'error'); } finally { setBusy(false); }
  };

  const addWishlist = async () => {
    if (!user) return needLogin();
    try { await api.post('/wishlist', { productId: product.id }); show('Added to wishlist'); }
    catch (e) { show(apiError(e), 'error'); }
  };

  return (
    <article className="group min-w-[270px] max-w-[330px] flex-1 overflow-hidden rounded-[24px] border border-black/8 bg-white card-lift">
      <div className="relative aspect-square overflow-hidden bg-[#f2f4f7]">
        <Link href={`/products/${product.slug}`}>
          <img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035] group-hover:opacity-0" />
          <img src={product.images?.[1] || product.images?.[0]} alt={`${product.name} alternate`} className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100" />
        </Link>
        {product.discountPercent > 0 && <span className="absolute left-4 top-4 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white">-{product.discountPercent}%</span>}
        <button onClick={addWishlist} aria-label="Add to wishlist" className="absolute right-4 top-4 rounded-full bg-white/90 p-2.5 shadow-sm backdrop-blur transition hover:scale-105"><Heart className="h-4 w-4" /></button>
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wider text-violet-600">{product.category?.name}</p><span className="flex items-center gap-1 text-xs font-semibold text-slate-600"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{product.rating}</span></div>
        <Link href={`/products/${product.slug}`} className="line-clamp-1 text-lg font-bold tracking-tight hover:text-violet-700">{product.name}</Link>
        <p className="mt-2 line-clamp-2 h-10 text-sm leading-5 text-slate-500">{product.shortDescription}</p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div><p className="text-lg font-black">{money(price)}</p>{product.discountPercent > 0 && <p className="text-xs text-slate-400 line-through">{money(product.price)}</p>}</div>
          <button disabled={busy || product.stock === 0} onClick={addCart} className="rounded-full bg-slate-950 p-3 text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Add to cart"><ShoppingBag className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  );
}
