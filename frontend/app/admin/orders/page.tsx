'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { apiError, money } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useOrderRealtime } from '@/lib/useOrderRealtime';

const statuses=['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
export default function AdminOrders(){
 const {show}=useToast(); const [orders,setOrders]=useState<Order[]>([]); const [busy,setBusy]=useState<number|null>(null);
 const load=useCallback(()=>{api.get<Order[]>('/orders/admin/all').then(r=>setOrders(r.data)).catch(()=>undefined)},[]); useEffect(()=>{load()},[load]); useOrderRealtime('admin-orders',load);
 const update=async(id:number,status:string)=>{setBusy(id);try{await api.patch(`/orders/${id}/status`,{status});show('Order status updated');load()}catch(e){show(apiError(e),'error')}finally{setBusy(null)}};
 return <div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">FULFILMENT</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Orders</h1><p className="mt-2 text-sm text-slate-500">Changing status triggers Pusher updates and an email when Mailer is enabled.</p><div className="mt-7 grid gap-4">{orders.map(o=><article key={o.id} className="rounded-[22px] border border-black/8 bg-white p-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{o.orderNumber}</h2><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-700">{o.paymentMethod}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${o.paymentStatus==='PAID'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{o.paymentStatus}</span></div><p className="mt-2 text-sm text-slate-500">{o.customerName} · {o.phone} · {new Date(o.createdAt).toLocaleString()}</p><p className="mt-1 text-xs text-slate-400">{o.address}, {o.city} - {o.postcode}</p></div><div className="flex flex-wrap items-center gap-3"><span className="text-lg font-black">{money(o.total)}</span><select disabled={busy===o.id} value={o.status} onChange={e=>update(o.id,e.target.value)} className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-bold outline-none disabled:opacity-50">{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></div></div><div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">{o.items.map(item=><div key={item.id} className="flex min-w-56 items-center gap-3 rounded-2xl bg-slate-50 p-3"><img src={item.image||'/images/products/headphones.png'} className="h-12 w-12 rounded-xl object-cover" alt=""/><div><p className="line-clamp-1 text-xs font-bold">{item.productName}</p><p className="mt-1 text-[11px] text-slate-400">Qty {item.quantity}</p></div></div>)}</div></article>)}</div></div>;
}
