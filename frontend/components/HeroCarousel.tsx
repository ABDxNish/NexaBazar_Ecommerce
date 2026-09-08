'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  WalletCards,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const slides = [
  {
    image: '/images/hero/hero-1.png',
    eyebrow: 'CURATED EVERYDAY PICKS',
    title: 'Discover your next everyday favorite.',
    text: 'Modern tech, fashion, beauty and lifestyle products in one polished shopping experience.',
  },
  {
    image: '/images/hero/hero-2.png',
    eyebrow: 'FRESH DROPS',
    title: 'Style that feels current, not complicated.',
    text: 'Clean product discovery, smart filters, wishlist and a checkout flow designed for mobile too.',
  },
  {
    image: '/images/hero/hero-3.png',
    eyebrow: 'PAYMENT READY',
    title: 'Shop smarter. Pay your way.',
    text: 'Cash on delivery or secure SSLCOMMERZ checkout with server-side amount validation.',
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[index];

  return (
    <section className="shell pt-5 md:pt-7">
      <div className="relative min-h-[610px] overflow-hidden rounded-[30px] bg-slate-950 md:min-h-[680px]">

        {/* Hero background images */}
        {slides.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt="NexaBazar collection"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Strong overlay prevents text inside image from clashing */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/10 lg:via-slate-950/80" />

        {/* Hero content */}
        <div className="relative z-10 flex min-h-[610px] items-center px-7 py-20 text-white md:min-h-[680px] md:px-16 lg:px-24">
          <div
            className="max-w-2xl animate-fade-up"
            key={index}
          >
            <p className="mb-5 text-xs font-bold tracking-[.22em] text-white/75">
              {slide.eyebrow}
            </p>

            <h1 className="text-5xl font-black leading-[.98] tracking-[-.045em] text-white sm:text-6xl lg:text-7xl">
              {slide.title}
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/80 md:text-lg">
              {slide.text}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              {/* Shop button */}
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold !text-slate-950 transition hover:bg-slate-100"
              >
                Shop now
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Explore button */}
              <Link
                href="#featured"
                className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-bold !text-white backdrop-blur transition hover:bg-white/20"
              >
                Explore featured
              </Link>

            </div>
          </div>
        </div>

        {/* Slider controls */}
        <div className="absolute bottom-7 left-7 right-7 z-20 flex items-end justify-between md:bottom-10 md:left-12 md:right-12">

          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? 'w-11 bg-white'
                    : 'w-5 bg-white/35'
                }`}
              />
            ))}
          </div>

          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() =>
                setIndex(
                  (index - 1 + slides.length) % slides.length
                )
              }
              className="rounded-full border border-white/25 bg-black/20 p-3 !text-white backdrop-blur transition hover:bg-black/40"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={() =>
                setIndex((index + 1) % slides.length)
              }
              className="rounded-full border border-white/25 bg-black/20 p-3 !text-white backdrop-blur transition hover:bg-black/40"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="mx-auto -mt-1 grid max-w-5xl grid-cols-1 overflow-hidden rounded-b-[26px] border border-t-0 border-black/8 bg-white shadow-sm sm:grid-cols-3">

        <div className="flex items-center gap-3 px-6 py-4">
          <Truck className="h-5 w-5 text-violet-600" />

          <div>
            <p className="text-sm font-bold">
              Free delivery
            </p>
            <p className="text-xs text-slate-500">
              Over BDT 3,000
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-y border-black/5 px-6 py-4 sm:border-x sm:border-y-0">
          <WalletCards className="h-5 w-5 text-violet-600" />

          <div>
            <p className="text-sm font-bold">
              BD payment ready
            </p>
            <p className="text-xs text-slate-500">
              SSLCOMMERZ + COD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4">
          <ShieldCheck className="h-5 w-5 text-violet-600" />

          <div>
            <p className="text-sm font-bold">
              Validated checkout
            </p>
            <p className="text-xs text-slate-500">
              Server-calculated totals
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}