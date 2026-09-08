'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { WishlistItem } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { apiError } from '@/lib/utils';

export default function WishlistPage() {
  const { user, loading } = useAuth(); const { show } = useToast(); const [items, setItems] = useState<WishlistItem[]>([]);
  const load = () => user && api.get<WishlistItem[]>('/wishlist').then((r) => setItems(r.data)).catch(() => setItems([]));
  useEffect(() => { load(); }, [user]);
  const remove = async (id: number) => { try { await api.delete(`/wishlist/${id}`); load(); show('Removed from wishlist'); } catch (e) { show(apiError(e), 'error'); } };
  if (loading) return <div className="shell py-16"><div className="h-96 animate-pulse rounded-[28px] bg-slate-200" /></div>;
  if (!user) return <div className="shell py-20 text-center"><Heart className="mx-auto h-10 w-10 text-slate-300" /><h1 className="mt-5 text-2xl font-black">Login to use your wishlist</h1><Link href="/login" className="btn-primary mt-6">Login</Link></div>;
  return <div className="shell py-10 md:py-14"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">SAVED FOR LATER</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Wishlist</h1>{items.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item) => <div key={item.id} className="relative"><ProductCard product={item.product} /><button onClick={() => remove(item.product.id)} className="absolute bottom-4 right-16 z-10 rounded-full bg-rose-50 p-3 text-rose-600 shadow-sm" aria-label="Remove from wishlist"><Trash2 className="h-4 w-4" /></button></div>)}</div> : <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-white py-20 text-center"><h2 className="text-xl font-bold">Nothing saved yet</h2><p className="mt-2 text-sm text-slate-500">Tap the heart on a product card to keep it here.</p><Link href="/products" className="btn-primary mt-5">Explore products</Link></div>}</div>;
}
