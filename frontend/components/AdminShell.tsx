'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Boxes,
  LayoutDashboard,
  PackageCheck,
  Tags,
  ArrowLeft,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';



const links = [
  {
    href: '/admin',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/products',
    label: 'Products',
    icon: Boxes,
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    icon: Tags,
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: PackageCheck,
  },
];

type RealtimeOrderData = {
  id?: number;
  orderNumber?: string;
  customerName?: string;
  status?: string;
  paymentStatus?: string;
  total?: number;
};

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  
  const path = usePathname();

  /*
   * This callback runs whenever Pusher sends:
   *
   * order-created
   * order-updated
   */
  

  if (loading) {
    return (
      <div className="shell py-16">
        <div className="h-[600px] animate-pulse rounded-[28px] bg-slate-200" />
      </div>
    );
  }

  if (
    !user ||
    user.role !== 'ADMIN'
  ) {
    return (
      <div className="shell py-20 text-center">
        <h1 className="text-3xl font-black">
          Admin access required
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Login with the seeded admin
          account or promote your own
          user in the database.
        </p>

        <Link
          href="/login"
          className="btn-primary mt-6 !text-white"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">

        <aside className="h-fit rounded-[24px] bg-slate-950 p-4 text-white lg:sticky lg:top-24">

          <div className="px-3 py-4">
            <p className="text-xs font-bold tracking-[.2em] !text-violet-300">
              ADMIN
            </p>

            <p className="mt-1 font-black !text-white">
              NexaBazar Control
            </p>
          </div>

          <nav className="mt-2 grid gap-1">

            {links.map(
              ({
                href,
                label,
                icon: Icon,
              }) => {
                const active =
                  path === href ||
                  (
                    href !==
                      '/admin' &&
                    path.startsWith(
                      `${href}/`
                    )
                  );

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-bold
                      transition
                      ${
                        active
                          ? 'bg-white !text-slate-950 shadow-sm'
                          : '!text-white/65 hover:bg-white/10 hover:!text-white'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 shrink-0" />

                    <span>
                      {label}
                    </span>
                  </Link>
                );
              }
            )}

          </nav>

          <Link
            href="/"
            className="
              mt-5
              flex
              items-center
              gap-2
              border-t
              border-white/10
              px-3
              pt-5
              text-xs
              font-bold
              !text-white/50
              transition
              hover:!text-white
            "
          >
            <ArrowLeft className="h-4 w-4" />

            Storefront
          </Link>

        </aside>

        <section className="min-w-0">
          {children}
        </section>

      </div>
    </div>
  );
}