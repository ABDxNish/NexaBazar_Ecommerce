'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit3, Save, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { apiError, slugify } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

const schema=z.object({name:z.string().trim().min(2).max(80),slug:z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),image:z.string().trim().max(500).optional()});
type Form=z.infer<typeof schema>;

export default function AdminCategories(){
 const {show}=useToast(); const [items,setItems]=useState<Category[]>([]); const [editing,setEditing]=useState<Category|null>(null); const {register,handleSubmit,reset,setValue,watch,formState:{errors,isSubmitting}}=useForm<Form>({resolver:zodResolver(schema),defaultValues:{name:'',slug:'',image:''}}); const name=watch('name');
 const load=()=>api.get<Category[]>('/categories').then(r=>setItems(r.data)); useEffect(()=>{load()},[]);
 const submit=async(data:Form)=>{try{if(editing)await api.patch(`/categories/${editing.id}`,data);else await api.post('/categories',data);show(editing?'Category updated':'Category created');setEditing(null);reset({name:'',slug:'',image:''});load()}catch(e){show(apiError(e),'error')}};
 const edit=(c:Category)=>{setEditing(c);reset({name:c.name,slug:c.slug,image:c.image||''});window.scrollTo({top:100,behavior:'smooth'})};
 const del=async(id:number)=>{if(!confirm('Delete this category? It is blocked if products still belong to it.'))return;try{await api.delete(`/categories/${id}`);show('Category deleted');load()}catch(e){show(apiError(e),'error')}};
 return <div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">CATALOG</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Categories</h1><div className="mt-7 grid gap-6 xl:grid-cols-[390px_1fr]"><form onSubmit={handleSubmit(submit)} className="h-fit rounded-[24px] border border-black/8 bg-white p-6 xl:sticky xl:top-24"><div className="flex items-center justify-between"><h2 className="text-lg font-black">{editing?'Edit category':'New category'}</h2>{editing&&<button type="button" onClick={()=>{setEditing(null);reset({name:'',slug:'',image:''})}} className="rounded-full bg-slate-100 p-2"><X className="h-4 w-4"/></button>}</div><div className="mt-5 grid gap-4"><Field label="Name" error={errors.name?.message}><input {...register('name')} onBlur={()=>{if(!editing&&name)setValue('slug',slugify(name),{shouldValidate:true})}} className="input" placeholder="Electronics"/></Field><Field label="Slug" error={errors.slug?.message}><input {...register('slug')} className="input" placeholder="electronics"/></Field><Field label="Image path / URL" error={errors.image?.message}><input {...register('image')} className="input" placeholder="/images/categories/electronics.png"/></Field></div><button disabled={isSubmitting} className="btn-primary mt-5 w-full"><Save className="h-4 w-4"/>{editing?'Save changes':'Create category'}</button></form>
 <div className="grid gap-3">{items.map(c=><div key={c.id} className="flex items-center gap-4 rounded-[22px] border border-black/8 bg-white p-4"><img src={c.image||'/images/categories/lifestyle.png'} className="h-20 w-24 rounded-2xl bg-slate-100 object-cover" alt=""/><div className="min-w-0 flex-1"><p className="font-black">{c.name}</p><p className="mt-1 text-xs text-slate-400">{c.slug}</p></div><div className="flex gap-2"><button onClick={()=>edit(c)} className="rounded-full bg-slate-100 p-2.5"><Edit3 className="h-4 w-4"/></button><button onClick={()=>del(c.id)} className="rounded-full bg-rose-50 p-2.5 text-rose-600"><Trash2 className="h-4 w-4"/></button></div></div>)}</div></div></div>;
}
function Field({label,error,children}:{label:string;error?:string;children:React.ReactNode}){return <label><span className="mb-1.5 block text-sm font-bold">{label}</span>{children}{error&&<span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}</label>}
