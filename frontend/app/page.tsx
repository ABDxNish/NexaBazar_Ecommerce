'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Category, Product } from '@/lib/types';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCarousel from '@/components/ProductCarousel';
import PromoBand from '@/components/PromoBand';
import Link from 'next/link';
import { ArrowRight, RefreshCcw, ShieldCheck, Sparkles } from 'lucide-react';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [sale, setSale] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([api.get('/products/featured'), api.get('/products/sale'), api.get('/categories')])
      .then(([f, s, c]) => { setFeatured(f.data); setSale(s.data); setCategories(c.data); })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <HeroCarousel />
      <CategoryGrid categories={categories} />
      <ProductCarousel id="featured" title="Featured right now" subtitle="A horizontal draggable showcase: use the arrows, drag with your mouse, or swipe naturally on mobile." products={featured} />
      <PromoBand />
      <ProductCarousel title="Deals worth a look" subtitle="Discounted demo products with stock, pricing and checkout calculated again on the backend." products={sale} />

      <section className="shell py-16">
        <div className="grid overflow-hidden rounded-[30px] bg-[#111827] text-white lg:grid-cols-2">
          <div className="p-8 md:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">BUILT FOR REAL FLOWS</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-5xl">Not a static storefront.</h2>
            <p className="mt-6 max-w-xl leading-7 text-white/65">Registration, session login, Google OAuth wiring, PostgreSQL CRUD, wishlist, cart, stock-aware checkout, SSLCOMMERZ, Pusher notifications and Mailer all connect to the NestJS backend.</p>
            <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold !text-slate-950">Start shopping <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[{ icon: ShieldCheck, title: 'Dual validation', text: 'Zod + React Hook Form in front; DTO validation in NestJS.' }, { icon: RefreshCcw, title: 'Realtime ready', text: 'Pusher updates admins and customers when orders change.' }, { icon: Sparkles, title: 'Responsive UI', text: 'Desktop navigation turns into a proper mobile side drawer.' }].map(({ icon: Icon, title, text }) => <div key={title} className="bg-[#171c28] p-7"><Icon className="h-6 w-6 text-violet-300" /><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{text}</p></div>)}
          </div>
        </div>
      </section>
    </>
  );
}
