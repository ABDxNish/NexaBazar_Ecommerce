'use client';

import {
  Suspense,
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { api } from '@/lib/api';
import {
  Category,
  Product,
} from '@/lib/types';

import ProductCard from '@/components/ProductCard';

import {
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';


/* =========================================================
   PAGE WRAPPER

   Suspense is used because useSearchParams() is used below.
========================================================= */

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="shell py-14">
          <div className="h-[500px] animate-pulse rounded-[28px] bg-slate-200" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}


/* =========================================================
   MAIN PRODUCTS PAGE
========================================================= */

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [total, setTotal] =
    useState(0);

  const [pages, setPages] =
    useState(1);

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState('');

  const [category, setCategory] =
    useState('');

  const [sort, setSort] =
    useState('newest');

  const [minPrice, setMinPrice] =
    useState('');

  const [maxPrice, setMaxPrice] =
    useState('');

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);


  /* =====================================================
     LOAD CATEGORIES ONCE
  ===================================================== */

  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then((response) => {
        setCategories(response.data);
      })
      .catch(() => undefined);
  }, []);


  /* =====================================================
     IMPORTANT FIX

     Whenever:

     ?category=beauty

     changes to:

     ?category=electronics

     update React state immediately.
  ===================================================== */

  useEffect(() => {
    const urlCategory =
      searchParams.get('category') || '';

    setCategory(urlCategory);

    setPage(1);
  }, [searchParams]);


  /* =====================================================
     LOAD PRODUCTS

     This already reacts correctly whenever category,
     search, sort, page or price changes.
  ===================================================== */

 useEffect(() => {
  const timer = setTimeout(
    async () => {
      const min =
        minPrice !== ''
          ? Number(minPrice)
          : undefined;

      const max =
        maxPrice !== ''
          ? Number(maxPrice)
          : undefined;

      /*
       * Do NOT call backend while user is
       * temporarily entering an invalid range.
       *
       * Example:
       * min = 1200
       * max = 219
       */
      if (
        min !== undefined &&
        max !== undefined &&
        min > max
      ) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data } =
          await api.get(
            '/products',
            {
              params: {
                search:
                  search ||
                  undefined,

                category:
                  category ||
                  undefined,

                sort,

                page,

                limit: 12,

                minPrice: min,

                maxPrice: max,
              },
            },
          );

        setProducts(data.items);
        setTotal(data.total);
        setPages(data.pages);

      } catch (error) {
        console.error(
          'Failed to load products:',
          error,
        );
      } finally {
        setLoading(false);
      }
    },
    350,
  );

  return () =>
    clearTimeout(timer);

}, [
  search,
  category,
  sort,
  page,
  minPrice,
  maxPrice,
]);


  /* =====================================================
     CATEGORY CHANGE

     Updates BOTH:
     1. React state
     2. URL

     Example:
     /products?category=electronics
  ===================================================== */

  const changeCategory = (
    value: string
  ) => {
    setCategory(value);

    setPage(1);

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (value) {
      params.set(
        'category',
        value
      );
    } else {
      params.delete(
        'category'
      );
    }

    const query =
      params.toString();

    router.replace(
      query
        ? `/products?${query}`
        : '/products',
      {
        scroll: false,
      }
    );
  };


  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clear = () => {
    setSearch('');

    setCategory('');

    setSort('newest');

    setMinPrice('');

    setMaxPrice('');

    setPage(1);

    router.replace(
      '/products',
      {
        scroll: false,
      }
    );
  };


  return (
    <div className="shell py-10 md:py-14">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="rounded-[28px] bg-slate-950 px-6 py-10 text-white md:px-10 md:py-14">

        <p className="text-xs font-bold tracking-[.2em] text-violet-300">
          ALL PRODUCTS
        </p>

        <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>
            <h1 className="text-4xl font-black tracking-[-.04em] md:text-5xl">
              Find something useful.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
              Search, filter, sort and
              paginate products pulled
              from PostgreSQL through
              the NestJS API.
            </p>
          </div>


          {/* SEARCH */}

          <div className="relative w-full max-w-xl">

            <Search
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                h-5
                w-5
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );

                setPage(1);
              }}
              placeholder="Search products..."
              className="
                w-full
                rounded-full
                border
                border-white/15
                bg-white/10
                py-3.5
                pl-12
                pr-5
                !text-white
                outline-none
                placeholder:!text-white/40
                focus:border-violet-400
              "
            />

          </div>

        </div>

      </div>


      {/* =================================================
          RESULTS + SORT
      ================================================= */}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">

        <p className="text-sm text-slate-500">
          <span className="font-bold text-slate-900">
            {total}
          </span>{' '}
          products found
        </p>


        <div className="flex gap-2">

          <select
            value={sort}
            onChange={(event) => {
              setSort(
                event.target.value
              );

              setPage(1);
            }}
            className="
              rounded-full
              border
              border-black/10
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              outline-none
            "
          >
            <option value="newest">
              Newest
            </option>

            <option value="price-asc">
              Price: low to high
            </option>

            <option value="price-desc">
              Price: high to low
            </option>

            <option value="rating">
              Top rated
            </option>
          </select>


          <button
            type="button"
            onClick={() =>
              setFiltersOpen(true)
            }
            className="btn-secondary lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />

            Filters
          </button>

        </div>

      </div>


      {/* =================================================
          SIDEBAR + PRODUCTS
      ================================================= */}

      <div className="mt-7 grid gap-7 lg:grid-cols-[240px_1fr]">

        {/* DESKTOP FILTERS */}

        <aside className="hidden h-fit rounded-[22px] border border-black/8 bg-white p-5 lg:block">

          <FilterBody
            categories={categories}

            category={category}

            setCategory={
              changeCategory
            }

            minPrice={minPrice}

            setMinPrice={(value) => {
              setMinPrice(value);

              setPage(1);
            }}

            maxPrice={maxPrice}

            setMaxPrice={(value) => {
              setMaxPrice(value);

              setPage(1);
            }}

            clear={clear}
          />

        </aside>


        {/* PRODUCTS */}

        <div>

          {/* LOADING */}

          {loading ? (

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {Array.from({
                length: 9,
              }).map((_, index) => (

                <div
                  key={index}
                  className="aspect-[.78] animate-pulse rounded-[24px] bg-slate-200"
                />

              ))}

            </div>

          ) : products.length ? (

            /* PRODUCT GRID */

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {products.map(
                (product) => (

                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                  />

                )
              )}

            </div>

          ) : (

            /* NO PRODUCTS */

            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white py-24 text-center">

              <h2 className="text-xl font-bold">
                No products matched
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try clearing a filter
                or using a broader
                search.
              </p>

              <button
                type="button"
                onClick={clear}
                className="btn-primary mt-5"
              >
                Clear filters
              </button>

            </div>

          )}


          {/* PAGINATION */}

          {pages > 1 && (

            <div className="mt-10 flex flex-wrap justify-center gap-2">

              {Array.from(
                {
                  length: pages,
                },
                (_, index) =>
                  index + 1
              ).map(
                (pageNumber) => (

                  <button
                    key={
                      pageNumber
                    }
                    type="button"
                    onClick={() => {
                      setPage(
                        pageNumber
                      );

                      window.scrollTo({
                        top: 250,
                        behavior:
                          'smooth',
                      });
                    }}
                    className={`
                      h-10
                      min-w-10
                      rounded-full
                      px-3
                      text-sm
                      font-bold
                      ${
                        page ===
                        pageNumber
                          ? 'bg-slate-950 !text-white'
                          : 'border border-black/10 bg-white !text-slate-950'
                      }
                    `}
                  >
                    {pageNumber}
                  </button>

                )
              )}

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          MOBILE FILTER DRAWER
      ================================================= */}

      {filtersOpen && (
        <>

          <div
            className="fixed inset-0 z-[90] bg-black/40"
            onClick={() =>
              setFiltersOpen(false)
            }
          />


          <aside className="fixed bottom-0 left-0 right-0 z-[100] max-h-[78vh] overflow-auto rounded-t-[28px] bg-white p-6 shadow-2xl">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setFiltersOpen(
                    false
                  )
                }
                className="rounded-full bg-slate-100 p-2"
              >
                <X className="h-5 w-5" />
              </button>

            </div>


            <FilterBody
              categories={categories}

              category={category}

              setCategory={
                changeCategory
              }

              minPrice={minPrice}

              setMinPrice={(value) => {
                setMinPrice(value);

                setPage(1);
              }}

              maxPrice={maxPrice}

              setMaxPrice={(value) => {
                setMaxPrice(value);

                setPage(1);
              }}

              clear={clear}
            />


            <button
              type="button"
              onClick={() =>
                setFiltersOpen(false)
              }
              className="btn-primary mt-5 w-full"
            >
              Show products
            </button>

          </aside>

        </>
      )}

    </div>
  );
}


/* =========================================================
   FILTER BODY
========================================================= */

function FilterBody({
  categories,
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  clear,
}: {
  categories: Category[];

  category: string;

  setCategory:
    (value: string) => void;

  minPrice: string;

  setMinPrice:
    (value: string) => void;

  maxPrice: string;

  setMaxPrice:
    (value: string) => void;

  clear: () => void;
}) {
  return (
    <div>

      {/* CATEGORY */}

      <div className="flex items-center justify-between">

        <h3 className="font-bold">
          Category
        </h3>

        <button
          type="button"
          onClick={clear}
          className="text-xs font-bold !text-violet-600"
        >
          Reset all
        </button>

      </div>


      <div className="mt-4 grid gap-2">

        {/* ALL */}

        <button
          type="button"
          onClick={() =>
            setCategory('')
          }
          className={`
            rounded-xl
            px-3
            py-2.5
            text-left
            text-sm
            ${
              !category
                ? 'bg-slate-950 font-bold !text-white'
                : 'bg-slate-50 !text-slate-700'
            }
          `}
        >
          All categories
        </button>


        {/* CATEGORY BUTTONS */}

        {categories.map(
          (item) => (

            <button
              key={
                item.id
              }
              type="button"
              onClick={() =>
                setCategory(
                  item.slug
                )
              }
              className={`
                rounded-xl
                px-3
                py-2.5
                text-left
                text-sm
                ${
                  category ===
                  item.slug
                    ? 'bg-slate-950 font-bold !text-white'
                    : 'bg-slate-50 !text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              {item.name}
            </button>

          )
        )}

      </div>


      {/* PRICE */}

      <div className="mt-6 border-t pt-5">

        <h3 className="font-bold">
          Price range
        </h3>


        <div className="mt-3 grid grid-cols-2 gap-2">

          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) =>
              setMinPrice(
                event.target.value
              )
            }
            placeholder="Min"
            className="input"
          />


          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) =>
              setMaxPrice(
                event.target.value
              )
            }
            placeholder="Max"
            className="input"
          />

        </div>

      </div>

    </div>
  );
}