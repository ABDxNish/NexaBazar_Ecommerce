'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { money } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useOrderRealtime } from '@/lib/useOrderRealtime';

export default function OrdersPage(){
  const {user,loading}=useAuth(); const [orders,setOrders]=useState<Order[]>([]);
  const load=useCallback(()=>{if(user)api.get<Order[]>('/orders/my').then(r=>setOrders(r.data)).catch(()=>setOrders([]));},[user]);
  useEffect(()=>{load();},[load]); useOrderRealtime(user?`user-${user.id}`:null,load);
  if(loading)return <div className="shell py-16"><div className="h-96 animate-pulse rounded-[28px] bg-slate-200"/></div>;
  if(!user)return <div className="shell py-20 text-center"><h1 className="text-2xl font-black">Login to see orders</h1><Link href="/login" className="btn-primary mt-6">Login</Link></div>;
  return <div className="shell py-10 md:py-14"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">ORDER HISTORY</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em]">My orders</h1><p className="mt-2 text-sm text-slate-500">Pusher can refresh this list in realtime when the admin changes an order status.</p>
  <div className="mt-8 grid gap-4">{orders.length?orders.map(o=><Link href={`/account/orders/${o.id}`} key={o.id} className="grid gap-4 rounded-[22px] border border-black/8 bg-white p-5 transition hover:border-violet-200 hover:shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"><div className="flex items-start gap-4"><span className="rounded-2xl bg-slate-100 p-3"><Package className="h-5 w-5"/></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{o.orderNumber}</h2><Badge value={o.status}/><Badge value={o.paymentStatus}/></div><p className="mt-2 text-sm text-slate-500">{new Date(o.createdAt).toLocaleString()} · {o.items.length} product line(s) · {o.paymentMethod}</p></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><span className="text-lg font-black">{money(o.total)}</span><ChevronRight className="h-5 w-5 text-slate-400"/></div></Link>):<div className="rounded-[26px] border border-dashed border-slate-300 bg-white py-20 text-center"><h2 className="text-xl font-bold">No orders yet</h2><Link href="/products" className="btn-primary mt-5">Start shopping</Link></div>}</div></div>;
}
function Badge({value}:{value:string}){const good=['PAID','DELIVERED','CONFIRMED'].includes(value); const bad=['FAILED','CANCELLED'].includes(value);return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${good?'bg-emerald-50 text-emerald-700':bad?'bg-rose-50 text-rose-700':'bg-amber-50 text-amber-700'}`}>{value}</span>}
