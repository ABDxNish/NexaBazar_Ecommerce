'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { apiError, money, salePrice } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function AdminProducts(){
 const {show}=useToast(); const [products,setProducts]=useState<Product[]>([]);
 const load=()=>api.get('/products',{params:{limit:50,sort:'newest'}}).then(r=>setProducts(r.data.items)); useEffect(()=>{load()},[]);
 const remove=async(id:number)=>{if(!confirm('Delete this product? Existing order snapshots will remain, but cart/wishlist references are removed.'))return;try{await api.delete(`/products/${id}`);show('Product deleted');load()}catch(e){show(apiError(e),'error')}};
 return <div><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">CATALOG</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Products</h1></div><Link href="/admin/products/new" className="btn-primary"><Plus className="h-4 w-4"/> Add product</Link></div><div className="mt-7 overflow-x-auto rounded-[24px] border border-black/8 bg-white"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Featured</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{products.map(p=><tr key={p.id} className="border-t border-black/5"><td className="p-4"><div className="flex items-center gap-3"><img src={p.images[0]} className="h-14 w-14 rounded-xl bg-slate-100 object-cover" alt=""/><div><p className="font-bold">{p.name}</p><p className="mt-1 text-xs text-slate-400">#{p.id} · {p.slug}</p></div></div></td><td className="p-4">{p.category.name}</td><td className="p-4"><b>{money(salePrice(p))}</b>{p.discountPercent>0&&<span className="ml-2 text-xs text-slate-400 line-through">{money(p.price)}</span>}</td><td className="p-4"><span className={p.stock<5?'font-bold text-rose-600':''}>{p.stock}</span></td><td className="p-4">{p.featured?'Yes':'No'}</td><td className="p-4"><div className="flex justify-end gap-2"><Link href={`/admin/products/${p.id}`} className="rounded-full bg-slate-100 p-2.5"><Edit3 className="h-4 w-4"/></Link><button onClick={()=>remove(p.id)} className="rounded-full bg-rose-50 p-2.5 text-rose-600"><Trash2 className="h-4 w-4"/></button></div></td></tr>)}</tbody></table></div></div>;
}
