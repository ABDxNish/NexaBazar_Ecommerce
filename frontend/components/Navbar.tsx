'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, UserRound, X, ChevronRight, LogOut } from 'lucide-react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    api.get<Category[]>('/categories').then((r) => setCategories(r.data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const load = () => {
      if (!user) return setCartCount(0);
      api.get('/cart').then((r) => setCartCount(r.data.count || 0)).catch(() => setCartCount(0));
    };
    load();
    window.addEventListener('cart-updated', load);
    return () => window.removeEventListener('cart-updated', load);
  }, [user]);

  const doLogout = async () => {
    await logout();
    setOpen(false);
    router.push('/');
  };

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-black/5 bg-white/88 backdrop-blur-xl">
        <div className="shell flex h-[76px] items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
            <img src="/logo.svg" alt="NexaBazar" className="h-11 w-auto" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex">
            <Link href="/" className="hover:text-violet-600">Home</Link>
            <Link href="/products" className="hover:text-violet-600">Shop</Link>
            <div className="group relative">
              <button className="py-7 hover:text-violet-600">Categories</button>
              <div className="pointer-events-none absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-2 rounded-2xl border border-black/10 bg-white p-2 opacity-0 shadow-2xl transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                {categories.map((c) => <Link key={c.id} href={`/products?category=${c.slug}`} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-slate-50"><span>{c.name}</span><ChevronRight className="h-4 w-4" /></Link>)}
              </div>
            </div>
            <Link href="/#featured" className="hover:text-violet-600">Featured</Link>
            {user?.role === 'ADMIN' && <Link href="/admin" className="rounded-full bg-violet-100 px-4 py-2 text-violet-700">Admin</Link>}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/products" aria-label="Search" className="rounded-full p-2.5 hover:bg-slate-100"><Search className="h-5 w-5" /></Link>
            <Link href="/wishlist" aria-label="Wishlist" className="hidden rounded-full p-2.5 hover:bg-slate-100 sm:block"><Heart className="h-5 w-5" /></Link>
            <Link href="/cart" aria-label="Cart" className="relative rounded-full p-2.5 hover:bg-slate-100">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -right-0.5 top-0 min-w-5 rounded-full bg-violet-600 px-1 text-center text-[11px] font-bold leading-5 text-white">{cartCount}</span>}
            </Link>
            {user ? (
              <Link href="/account" className="hidden items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-sm font-semibold md:flex"><UserRound className="h-4 w-4" />{user.fullName.split(' ')[0]}</Link>
            ) : (
              <Link href="/login" className="hidden rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold !text-white md:block">Login</Link>
            )}
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-full p-2.5 hover:bg-slate-100 lg:hidden"><Menu className="h-6 w-6" /></button>
          </div>
        </div>
      </div>

      {open && <div className="fixed inset-0 z-[90] bg-black/35 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed right-0 top-0 z-[100] h-full w-[86%] max-w-sm bg-white p-6 shadow-2xl transition-transform duration-300 lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between"><img src="/logo.svg" alt="NexaBazar" className="h-10" /><button onClick={() => setOpen(false)} className="rounded-full bg-slate-100 p-2"><X className="h-5 w-5" /></button></div>
        {user && <div className="mt-7 rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs text-white/60">Signed in as</p><p className="mt-1 font-bold">{user.fullName}</p><p className="text-xs text-white/60">{user.email}</p></div>}
        <div className="mt-7 grid gap-1 font-semibold">
          <Link onClick={() => setOpen(false)} href="/" className="rounded-xl px-3 py-3 hover:bg-slate-50">Home</Link>
          <Link onClick={() => setOpen(false)} href="/products" className="rounded-xl px-3 py-3 hover:bg-slate-50">All products</Link>
          <Link onClick={() => setOpen(false)} href="/wishlist" className="rounded-xl px-3 py-3 hover:bg-slate-50">Wishlist</Link>
          <Link onClick={() => setOpen(false)} href="/cart" className="rounded-xl px-3 py-3 hover:bg-slate-50">Cart ({cartCount})</Link>
          {user && <Link onClick={() => setOpen(false)} href="/account" className="rounded-xl px-3 py-3 hover:bg-slate-50">My account</Link>}
          {user && <Link onClick={() => setOpen(false)} href="/account/orders" className="rounded-xl px-3 py-3 hover:bg-slate-50">My orders</Link>}
          {user?.role === 'ADMIN' && <Link onClick={() => setOpen(false)} href="/admin" className="rounded-xl px-3 py-3 text-violet-700 hover:bg-violet-50">Admin dashboard</Link>}
        </div>
        <div className="mt-7 border-t pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Categories</p>
          <div className="grid grid-cols-2 gap-2">{categories.map((c) => <Link key={c.id} onClick={() => setOpen(false)} href={`/products?category=${c.slug}`} className="rounded-xl bg-slate-100 px-3 py-3 text-sm">{c.name}</Link>)}</div>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          {user ? <button onClick={doLogout} className="btn-secondary w-full"><LogOut className="h-4 w-4" /> Logout</button> : <Link href="/login" onClick={() => setOpen(false)} className="btn-primary w-full">Login / Register</Link>}
        </div>
      </aside>
    </>
  );
}
