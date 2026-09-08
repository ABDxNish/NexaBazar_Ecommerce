import Link from 'next/link';
import { Category } from '@/lib/types';
import { ArrowUpRight } from 'lucide-react';

const categoryImages: Record<string, string> = {
  beauty: '/images/categories/beauty-new.png',
  electronics: '/images/categories/electronics-new.png',
  fashion: '/images/categories/fashion-new.png',
  'home & living': '/images/categories/home-living-new.png',
  lifestyle: '/images/categories/lifestyle-new.png',
};

export default function CategoryGrid({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <section className="shell py-14 md:py-20">

      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">
          SHOP BY MOOD
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-[-.035em] md:text-4xl">
          Find your category
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

        {categories.map((category, index) => {
          const image =
            categoryImages[category.name.toLowerCase()] ||
            category.image ||
            '/images/categories/lifestyle-new.png';

          return (
            <Link
              href={`/products?category=${category.slug}`}
              key={category.id}
              className={`group relative min-h-[250px] overflow-hidden rounded-[24px] ${
                index < 2 ? 'lg:col-span-2' : ''
              }`}
            >

              {/* Category photo */}
              <img
                src={image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover object-right transition duration-500 group-hover:scale-105"
              />

              {/* Dark gradient only for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

              {/* Category title + arrow */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-5">
                <span className="text-xl font-bold !text-white">
                  {category.name}
                </span>

                <span className="rounded-full bg-white/15 p-2 !text-white backdrop-blur transition duration-300 group-hover:bg-white group-hover:!text-slate-900">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

            </Link>
          );
        })}

      </div>
    </section>
  );
}