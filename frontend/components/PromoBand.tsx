import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PromoBand() {
  return <section className="shell py-10"><div className="relative overflow-hidden rounded-[28px] bg-slate-900"><img src="/images/deal-loop.gif" alt="Weekend promotion animation" className="h-[300px] w-full object-cover md:h-[340px]" /><div className="absolute inset-0 flex items-end justify-end p-6 md:p-10"><Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-xl">Browse deals <ArrowRight className="h-4 w-4" /></Link></div></div></section>;
}
