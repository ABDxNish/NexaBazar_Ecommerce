'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

import { api } from '@/lib/api';
import { CartSummary } from '@/lib/types';
import {
  money,
  salePrice,
  apiError,
} from '@/lib/utils';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function CartPage() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const { show } = useToast();

  const [cart, setCart] =
    useState<CartSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } =
        await api.get<CartSummary>('/cart');

      setCart(data);
    } catch {
      setCart({
        items: [],
        count: 0,
        subtotal: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (
    id: number,
    quantity: number
  ) => {
    try {
      await api.patch(
        `/cart/${id}`,
        {
          quantity,
        }
      );

      await load();

      window.dispatchEvent(
        new Event('cart-updated')
      );
    } catch (error) {
      show(
        apiError(error),
        'error'
      );
    }
  };

  const remove = async (
    id: number
  ) => {
    try {
      await api.delete(
        `/cart/${id}`
      );

      await load();

      window.dispatchEvent(
        new Event('cart-updated')
      );

      show('Item removed');
    } catch (error) {
      show(
        apiError(error),
        'error'
      );
    }
  };

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="shell py-14">
        <div className="h-[520px] animate-pulse rounded-[28px] bg-slate-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <Empty
        title="Login to view your cart"
        text="Your cart is connected to your account and stored in PostgreSQL."
        action="Login"
        href="/login"
      />
    );
  }

  if (!cart?.items.length) {
    return (
      <Empty
        title="Your cart is empty"
        text="Add a few products and they will appear here."
        action="Browse products"
        href="/products"
      />
    );
  }

  const shipping =
    cart.subtotal >= 3000
      ? 0
      : 80;

  return (
    <div className="shell py-10 md:py-14">

      {/* PAGE HEADER */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">
          YOUR BAG
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">
          Shopping cart
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {cart.count} item(s)
        </p>
      </div>

      <div className="grid gap-7 lg:grid-cols-[1fr_380px]">

        {/* CART ITEMS */}
        <div className="grid gap-4">
          {cart.items.map(
            (item) => {
              const unit =
                salePrice(
                  item.product
                );

              return (
                <article
                  key={item.id}
                  className="grid grid-cols-[105px_1fr] gap-4 rounded-[22px] border border-black/8 bg-white p-4 sm:grid-cols-[130px_1fr_auto] sm:items-center"
                >
                  {/* PRODUCT IMAGE */}
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
                  >
                    <img
                      src={
                        item.product
                          .images[0]
                      }
                      alt={
                        item.product
                          .name
                      }
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  {/* PRODUCT INFO */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                      {
                        item.product
                          .category
                          .name
                      }
                    </p>

                    <Link
                      href={`/products/${item.product.slug}`}
                      className="mt-1 block font-bold !text-slate-950"
                    >
                      {
                        item.product
                          .name
                      }
                    </Link>

                    <p className="mt-2 text-sm font-black text-slate-950">
                      {money(unit)}
                    </p>

                    {/* MOBILE QUANTITY */}
                    <div className="mt-4 flex items-center gap-3 sm:hidden">
                      <Qty
                        value={
                          item.quantity
                        }
                        min={1}
                        max={Math.min(
                          item.product
                            .stock,
                          20
                        )}
                        onChange={(
                          quantity
                        ) =>
                          update(
                            item.id,
                            quantity
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          remove(
                            item.id
                          )
                        }
                        className="rounded-full bg-rose-50 p-2.5 !text-rose-600 transition hover:bg-rose-100"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* DESKTOP CONTROLS */}
                  <div className="hidden min-w-36 justify-items-end gap-3 sm:grid">

                    <p className="font-black text-slate-950">
                      {money(
                        unit *
                          item.quantity
                      )}
                    </p>

                    <Qty
                      value={
                        item.quantity
                      }
                      min={1}
                      max={Math.min(
                        item.product
                          .stock,
                        20
                      )}
                      onChange={(
                        quantity
                      ) =>
                        update(
                          item.id,
                          quantity
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        remove(
                          item.id
                        )
                      }
                      className="flex items-center gap-1 text-xs font-bold !text-rose-600 transition hover:!text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>

                  </div>
                </article>
              );
            }
          )}
        </div>

        {/* ORDER SUMMARY */}
        <aside className="h-fit rounded-[26px] bg-slate-950 p-6 !text-white lg:sticky lg:top-24">

          <h2 className="text-xl font-black !text-white">
            Order summary
          </h2>

          <div className="mt-6 grid gap-4 text-sm">

            <div className="flex justify-between !text-white/65">
              <span>
                Subtotal
              </span>

              <span className="font-semibold !text-white">
                {money(
                  cart.subtotal
                )}
              </span>
            </div>

            <div className="flex justify-between !text-white/65">
              <span>
                Shipping
              </span>

              <span className="font-semibold !text-white">
                {shipping === 0
                  ? 'Free'
                  : money(
                      shipping
                    )}
              </span>
            </div>

          </div>

          <div className="my-5 h-px bg-white/10" />

          <div className="flex items-end justify-between">

            <span className="font-bold !text-white">
              Total
            </span>

            <span className="text-2xl font-black !text-white">
              {money(
                cart.subtotal +
                  shipping
              )}
            </span>

          </div>

          {shipping > 0 && (
            <p className="mt-3 text-xs !text-white/50">
              Add{' '}
              {money(
                3000 -
                  cart.subtotal
              )}{' '}
              more to unlock free delivery.
            </p>
          )}

          {/* CHECKOUT BUTTON */}
          <Link
            href="/checkout"
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              rounded-full
              bg-white
              px-5
              py-4
              text-sm
              font-black
              !text-slate-950
              transition
              hover:bg-slate-100
            "
          >
            Proceed to checkout
          </Link>

          {/* CONTINUE SHOPPING */}
          <Link
            href="/products"
            className="
              mt-3
              block
              text-center
              text-xs
              font-bold
              !text-white/55
              transition
              hover:!text-white
            "
          >
            Continue shopping
          </Link>

        </aside>

      </div>
    </div>
  );
}

/* =========================================================
   QUANTITY CONTROL
========================================================= */

function Qty({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-black/10 bg-white !text-slate-900">

      <button
        type="button"
        disabled={
          value <= min
        }
        onClick={() =>
          onChange(
            value - 1
          )
        }
        className="p-2 !text-slate-900 disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="w-7 text-center text-sm font-bold !text-slate-900">
        {value}
      </span>

      <button
        type="button"
        disabled={
          value >= max
        }
        onClick={() =>
          onChange(
            value + 1
          )
        }
        className="p-2 !text-slate-900 disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function Empty({
  title,
  text,
  action,
  href,
}: {
  title: string;
  text: string;
  action: string;
  href: string;
}) {
  return (
    <div className="shell py-20">

      <div className="rounded-[30px] border border-dashed border-slate-300 bg-white py-20 text-center">

        <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />

        <h1 className="mt-5 text-2xl font-black">
          {title}
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {text}
        </p>

        <Link
          href={href}
          className="btn-primary mt-6 !text-white"
        >
          {action}
        </Link>

      </div>

    </div>
  );
}