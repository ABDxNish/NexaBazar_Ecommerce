'use client';
import { useEffect,useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductForm from '@/components/ProductForm';
export default function EditProduct(){const {id}=useParams<{id:string}>();const [product,setProduct]=useState<Product|null>(null);useEffect(()=>{if(id)api.get<Product>(`/products/admin/${id}`).then(r=>setProduct(r.data))},[id]);if(!product)return <div className="h-[550px] animate-pulse rounded-[28px] bg-slate-200"/>;return <div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">CATALOG</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Edit product</h1><p className="mt-2 text-sm text-slate-500">#{product.id} · {product.name}</p><div className="mt-7"><ProductForm product={product}/></div></div>}
