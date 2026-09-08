'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  Banknote,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';

import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { money } from '@/lib/utils';

type Stats = {
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  customers: number;
};

export default function AdminDashboard() {
  const [stats, setStats] =
    useState<Stats | null>(null);

  const [orders, setOrders] =
    useState<Order[]>([]);

  /*
   * Load dashboard information
   */
  const load = useCallback(
    async () => {
      try {
        const [
          statsResponse,
          ordersResponse,
        ] = await Promise.all([
          api.get(
            '/orders/admin/stats'
          ),

          api.get(
            '/orders/admin/all'
          ),
        ]);

        setStats(
          statsResponse.data
        );

        setOrders(
          ordersResponse.data.slice(
            0,
            6
          )
        );
      } catch (error) {
        console.error(
          'Failed to load admin dashboard:',
          error
        );
      }
    },
    []
  );
  useEffect(() => {
  load();

  const realtimeRefresh = () => {
    load();
  };

  window.addEventListener(
    'admin-orders-updated',
    realtimeRefresh
  );

  return () => {
    window.removeEventListener(
      'admin-orders-updated',
      realtimeRefresh
    );
  };
}, [load]);

  /*
   * Initial load +
   * refresh whenever AdminShell
   * receives a Pusher order event
   */
  useEffect(() => {
    load();

    const realtimeRefresh =
      () => {
        console.log(
          'Refreshing admin dashboard after Pusher event'
        );

        load();
      };

    window.addEventListener(
      'admin-orders-updated',
      realtimeRefresh
    );

    return () => {
      window.removeEventListener(
        'admin-orders-updated',
        realtimeRefresh
      );
    };
  }, [load]);

  const cards = [
    {
      label: 'Total orders',
      value:
        stats?.totalOrders ??
        '—',

      icon: ShoppingBag,
    },

    {
      label: 'Pending',
      value:
        stats?.pendingOrders ??
        '—',

      icon: Package,
    },

    {
      label:
        'Paid revenue',

      value:
        stats
          ? money(
              stats.revenue
            )
          : '—',

      icon: Banknote,
    },

    {
      label: 'Customers',
      value:
        stats?.customers ??
        '—',

      icon: Users,
    },
  ];

  return (
    <div>

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">
            OVERVIEW
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">
            Admin dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            New orders and order
            status changes update
            automatically through
            Pusher.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="btn-primary !text-white"
        >
          + Add product
        </Link>

      </div>

      {/* STAT CARDS */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <div
              key={label}
              className="rounded-[22px] border border-black/8 bg-white p-5"
            >
              <span className="inline-flex rounded-xl bg-violet-50 p-3 text-violet-700">
                <Icon className="h-5 w-5" />
              </span>

              <p className="mt-5 text-sm text-slate-500">
                {label}
              </p>

              <p className="mt-1 text-2xl font-black">
                {value}
              </p>
            </div>
          )
        )}

      </div>

      {/* RECENT ORDERS */}
      <div className="mt-7 rounded-[24px] border border-black/8 bg-white p-5 md:p-6">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-black">
            Recent orders
          </h2>

          <Link
            href="/admin/orders"
            className="text-sm font-bold !text-violet-600"
          >
            View all
          </Link>

        </div>

        <div className="mt-5 overflow-x-auto">

          <table className="w-full min-w-[700px] text-left text-sm">

            <thead className="text-xs uppercase tracking-wider text-slate-400">

              <tr>
                <th className="pb-3">
                  Order
                </th>

                <th className="pb-3">
                  Customer
                </th>

                <th className="pb-3">
                  Payment
                </th>

                <th className="pb-3">
                  Status
                </th>

                <th className="pb-3 text-right">
                  Total
                </th>
              </tr>

            </thead>

            <tbody>

              {orders.map(
                (order) => (
                  <tr
                    key={
                      order.id
                    }
                    className="border-t border-black/5"
                  >

                    <td className="py-4 font-bold">
                      {
                        order.orderNumber
                      }
                    </td>

                    <td className="py-4">
                      {
                        order.customerName
                      }
                    </td>

                    <td className="py-4">
                      {
                        order.paymentMethod
                      }
                      {' · '}
                      {
                        order.paymentStatus
                      }
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                        {
                          order.status
                        }
                      </span>
                    </td>

                    <td className="py-4 text-right font-black">
                      {money(
                        order.total
                      )}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}