'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Category, Product } from '@/lib/types';
import { apiError, slugify } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

const schema=z.object({
 name:z.string().trim().min(2).max(140),
 slug:z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/,'Use lowercase letters, numbers and hyphens'),
 shortDescription:z.string().trim().min(10).max(220),
 description:z.string().trim().min(20).max(5000),
 price:z.number().min(1),
 discountPercent:z.number().int().min(0).max(90),
 stock:z.number().int().min(0),
 categoryId:z.number().int().min(1,'Choose a category'),
 featured:z.boolean(),
});
type Form=z.infer<typeof schema>;

export default function ProductForm({product}:{product?:Product}){
 const router=useRouter(); const {show}=useToast(); const [categories,setCategories]=useState<Category[]>([]); const [images,setImages]=useState<string[]>(product?.images||[]); const [files,setFiles]=useState<File[]>([]); const [busy,setBusy]=useState(false);
 const {register,handleSubmit,setValue,watch,formState:{errors}}=useForm<Form>({resolver:zodResolver(schema),defaultValues:{name:product?.name||'',slug:product?.slug||'',shortDescription:product?.shortDescription||'',description:product?.description||'',price:product?.price||0,discountPercent:product?.discountPercent||0,stock:product?.stock||0,categoryId:product?.category?.id||0,featured:product?.featured||false}});
 const name=watch('name');
 useEffect(()=>{api.get<Category[]>('/categories').then(r=>setCategories(r.data));},[]);
 const chooseFiles=(list:FileList|null)=>{if(!list)return; const chosen=Array.from(list); if(chosen.some(f=>!['image/jpeg','image/png','image/webp','image/gif'].includes(f.type)))return show('Only JPG, PNG, WEBP or GIF images are allowed','error'); if(chosen.some(f=>f.size>5*1024*1024))return show('Each image must be 5MB or smaller','error'); if(images.length+files.length+chosen.length>6)return show('Maximum 6 product images','error'); setFiles(prev=>[...prev,...chosen]);};
 const submit=async(data:Form)=>{setBusy(true);try{let allImages=[...images]; if(files.length){const fd=new FormData();files.forEach(f=>fd.append('files',f));const up=await api.post('/products/upload',fd,{headers:{'Content-Type':'multipart/form-data'}});allImages=[...allImages,...up.data.urls];} if(!allImages.length){show('Add at least one product image','error');setBusy(false);return;} const payload={...data,images:allImages}; if(product)await api.patch(`/products/${product.id}`,payload);else await api.post('/products',payload); show(product?'Product updated':'Product created'); router.push('/admin/products'); router.refresh();}catch(e){show(apiError(e),'error');}finally{setBusy(false)}};
 return <form onSubmit={handleSubmit(submit)} className="grid gap-6">
  <section className="rounded-[24px] border border-black/8 bg-white p-6"><h2 className="text-lg font-black">Basic information</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Product name" error={errors.name?.message}><input {...register('name')} onBlur={()=>{if(!product&&name)setValue('slug',slugify(name),{shouldValidate:true})}} className="input"/></Field><Field label="Slug" error={errors.slug?.message}><input {...register('slug')} className="input" placeholder="product-name"/></Field><div className="sm:col-span-2"><Field label="Short description" error={errors.shortDescription?.message}><input {...register('shortDescription')} className="input"/></Field></div><div className="sm:col-span-2"><Field label="Full description" error={errors.description?.message}><textarea {...register('description')} rows={6} className="input resize-none"/></Field></div></div></section>
  <section className="rounded-[24px] border border-black/8 bg-white p-6"><h2 className="text-lg font-black">Pricing & inventory</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Field label="Price (BDT)" error={errors.price?.message}><input {...register('price',{valueAsNumber:true})} type="number" min="1" step="0.01" className="input"/></Field><Field label="Discount %" error={errors.discountPercent?.message}><input {...register('discountPercent',{valueAsNumber:true})} type="number" min="0" max="90" className="input"/></Field><Field label="Stock" error={errors.stock?.message}><input {...register('stock',{valueAsNumber:true})} type="number" min="0" className="input"/></Field><Field label="Category" error={errors.categoryId?.message}><select {...register('categoryId',{valueAsNumber:true})} className="input"><option value="0">Choose...</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field></div><label className="mt-5 flex items-center gap-3 text-sm font-bold"><input {...register('featured')} type="checkbox" className="h-4 w-4 accent-violet-600"/> Show in featured carousel</label></section>
  <section className="rounded-[24px] border border-black/8 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black">Product gallery</h2><p className="mt-1 text-xs text-slate-500">1–6 images, JPG/PNG/WEBP/GIF, max 5MB each.</p></div><label className="btn-secondary"><ImagePlus className="h-4 w-4"/> Add images<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e=>chooseFiles(e.target.files)}/></label></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{images.map((img,i)=><div key={img+i} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"><img src={img} className="h-full w-full object-cover" alt="Existing product"/><button type="button" onClick={()=>setImages(prev=>prev.filter((_,x)=>x!==i))} className="absolute right-2 top-2 rounded-full bg-white p-2 text-rose-600 shadow"><Trash2 className="h-4 w-4"/></button></div>)}{files.map((file,i)=><div key={file.name+i} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"><img src={URL.createObjectURL(file)} className="h-full w-full object-cover" alt="New product preview"/><span className="absolute bottom-2 left-2 rounded-full bg-slate-950 px-2 py-1 text-[10px] font-bold text-white">NEW</span><button type="button" onClick={()=>setFiles(prev=>prev.filter((_,x)=>x!==i))} className="absolute right-2 top-2 rounded-full bg-white p-2 text-rose-600 shadow"><Trash2 className="h-4 w-4"/></button></div>)}</div></section>
  <div className="flex justify-end gap-3"><button type="button" onClick={()=>router.push('/admin/products')} className="btn-secondary">Cancel</button><button disabled={busy} className="btn-primary min-w-36 disabled:opacity-50">{busy?<><Loader2 className="h-4 w-4 animate-spin"/> Saving...</>:product?'Update product':'Create product'}</button></div>
 </form>;
}
function Field({label,error,children}:{label:string;error?:string;children:React.ReactNode}){return <label><span className="mb-1.5 block text-sm font-bold">{label}</span>{children}{error&&<span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}</label>}
