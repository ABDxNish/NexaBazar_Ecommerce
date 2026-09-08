import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-black/10 bg-[#10131a] text-white">
      <div className="shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="text-2xl font-black tracking-tight">NexaBazar</div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">Modern shopping built for Bangladesh — curated products, secure checkout and a clean mobile-first experience.</p>
        </div>
        <div>
          <h3 className="font-bold">Explore</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/65">
            <Link href="/products">All products</Link><Link href="/products">New arrivals</Link><Link href="/wishlist">Wishlist</Link><Link href="/account/orders">My orders</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Customer care</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/65">
            <span className="flex gap-2"><Phone className="h-4 w-4" /> +880 1700-000000</span>
            <span className="flex gap-2"><Mail className="h-4 w-4" /> hello@nexabazar.demo</span>
            <span className="flex gap-2"><MapPin className="h-4 w-4" /> Dhaka, Bangladesh</span>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Follow</h3>
          <div className="mt-4 flex gap-3">
            <span className="rounded-full bg-white/10 p-3"><Facebook className="h-5 w-5" /></span>
            <span className="rounded-full bg-white/10 p-3"><Instagram className="h-5 w-5" /></span>
          </div>
          <p className="mt-5 text-xs leading-5 text-white/45">Demo project. Payment flow is configured for SSLCOMMERZ sandbox until live credentials are supplied.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} NexaBazar. Built with Next.js, NestJS and PostgreSQL.</div>
    </footer>
  );
}
