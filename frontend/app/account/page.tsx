'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { LogOut, Package, ShieldCheck, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { apiError } from '@/lib/utils';

const phone = /^(?:\+?88)?01[3-9]\d{8}$/;
const schema = z.object({
  fullName: z.string().trim().min(3).max(100).regex(/^[A-Za-z .'-]+$/, 'Name contains invalid characters'),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().refine((v) => v === '' || phone.test(v), 'Use a valid Bangladeshi phone number'),
  address: z.string().trim().refine((v) => v === '' || v.length >= 5, 'Address should be at least 5 characters'),
  city: z.string().trim(),
  postcode: z.string().trim().refine((v) => v === '' || /^\d{4}$/.test(v), 'Postcode must be 4 digits'),
});
type Form = z.infer<typeof schema>;

export default function AccountPage() {
  const { user, loading, refresh, logout } = useAuth(); const { show } = useToast(); const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  useEffect(() => { if (user) reset({ fullName: user.fullName, email: user.email, phone: user.phone || '', address: user.address || '', city: user.city || '', postcode: user.postcode || '' }); }, [user, reset]);
  const submit = async (data: Form) => {
    const payload: Record<string,string> = { fullName: data.fullName, email: data.email };
    if (data.phone) payload.phone = data.phone; if (data.address) payload.address = data.address; if (data.city) payload.city = data.city; if (data.postcode) payload.postcode = data.postcode;
    try { await api.patch('/auth/profile', payload); await refresh(); show('Profile updated'); } catch (e) { show(apiError(e),'error'); }
  };
  if (loading) return <div className="shell py-16"><div className="h-96 animate-pulse rounded-[28px] bg-slate-200" /></div>;
  if (!user) return <div className="shell py-20 text-center"><UserRound className="mx-auto h-10 w-10 text-slate-300" /><h1 className="mt-5 text-2xl font-black">You are not signed in</h1><Link href="/login" className="btn-primary mt-6">Login</Link></div>;
  return <div className="shell py-10 md:py-14"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">MY ACCOUNT</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Hello, {user.fullName.split(' ')[0]}.</h1><p className="mt-2 text-sm text-slate-500">Manage your profile and orders.</p></div><div className="flex gap-2"><Link href="/account/orders" className="btn-secondary"><Package className="h-4 w-4" /> My orders</Link>{user.role === 'ADMIN' && <Link href="/admin" className="btn-primary"><ShieldCheck className="h-4 w-4" /> Admin</Link>}</div></div>
    {!user.phone && <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Complete your profile:</b> Google accounts may not provide a phone number. Add a Bangladeshi phone number before checkout.</div>}
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]"><form onSubmit={handleSubmit(submit)} className="rounded-[26px] border border-black/8 bg-white p-6 md:p-8"><h2 className="text-xl font-black">Profile information</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Full name" error={errors.fullName?.message}><input {...register('fullName')} className="input" /></Field><Field label="Email" error={errors.email?.message}><input {...register('email')} type="email" className="input" /></Field><Field label="Phone" error={errors.phone?.message}><input {...register('phone')} placeholder="01712345678" className="input" /></Field><Field label="City" error={errors.city?.message}><input {...register('city')} placeholder="Dhaka" className="input" /></Field><div className="sm:col-span-2"><Field label="Address" error={errors.address?.message}><input {...register('address')} placeholder="House, road, area" className="input" /></Field></div><Field label="Postcode" error={errors.postcode?.message}><input {...register('postcode')} placeholder="1212" className="input" /></Field></div><button disabled={isSubmitting} className="btn-primary mt-6">{isSubmitting ? 'Saving...' : 'Save changes'}</button></form>
    <aside className="h-fit rounded-[26px] bg-slate-950 p-6 text-white"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/20 text-xl font-black text-violet-200">{user.fullName.slice(0,1).toUpperCase()}</div><h3 className="mt-4 font-bold">{user.fullName}</h3><p className="mt-1 text-xs text-white/50">{user.email}</p><p className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{user.role}</p><button onClick={async () => { await logout(); router.push('/'); }} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-3 text-sm font-bold"><LogOut className="h-4 w-4" /> Logout</button></aside></div>
  </div>;
}
function Field({ label,error,children }:{label:string;error?:string;children:React.ReactNode}){return <label><span className="mb-1.5 block text-sm font-bold">{label}</span>{children}{error&&<span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}</label>}
