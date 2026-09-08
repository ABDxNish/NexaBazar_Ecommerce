'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductCarousel({ title, subtitle, products, id }: { title: string; subtitle?: string; products: Product[]; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, scroll: 0 });
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 650, behavior: 'smooth' });

  return (
    <section id={id} className="shell py-12 md:py-16">
      <div className="mb-7 flex items-end justify-between gap-5">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-violet-600">CURATED FOR YOU</p><h2 className="text-3xl font-black tracking-[-.035em] md:text-4xl">{title}</h2>{subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">{subtitle}</p>}</div>
        <div className="hidden gap-2 sm:flex"><button onClick={() => scroll(-1)} className="rounded-full border border-black/10 bg-white p-3 shadow-sm"><ChevronLeft className="h-5 w-5" /></button><button onClick={() => scroll(1)} className="rounded-full border border-black/10 bg-white p-3 shadow-sm"><ChevronRight className="h-5 w-5" /></button></div>
      </div>
      <div
        ref={ref}
        className="hide-scrollbar flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-4 active:cursor-grabbing md:gap-5"
        onPointerDown={(e) => { if (e.pointerType === 'mouse' && ref.current) drag.current = { active: true, x: e.clientX, scroll: ref.current.scrollLeft }; }}
        onPointerMove={(e) => { if (drag.current.active && ref.current) ref.current.scrollLeft = drag.current.scroll - (e.clientX - drag.current.x); }}
        onPointerUp={() => { drag.current.active = false; }}
        onPointerLeave={() => { drag.current.active = false; }}
      >
        {products.map((product) => <div key={product.id} className="snap-start"><ProductCard product={product} /></div>)}
      </div>
    </section>
  );
}
