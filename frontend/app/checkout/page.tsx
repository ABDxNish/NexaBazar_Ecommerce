'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { CreditCard, LockKeyhole, MapPin, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CartSummary, Order } from '@/lib/types';
import { apiError, money } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const schema = z.object({
  customerName: z.string().trim().min(3, 'Enter your full name').max(100).regex(/^[A-Za-z .'-]+$/, 'Use letters, spaces, apostrophes, dots or hyphens only'),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone: z.string().trim().regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Use a valid Bangladeshi phone number'),
  address: z.string().trim().min(8, 'Enter a complete delivery address').max(255),
  city: z.string().trim().min(2, 'Enter your city/district').max(80),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
  note: z.string().max(500).optional(),
  paymentMethod: z.enum(['COD', 'SSLCOMMERZ']),
});
type CheckoutForm = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth(); const { show } = useToast(); const router = useRouter();
  const [cart, setCart] = useState<CartSummary | null>(null); const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CheckoutForm>({ resolver: zodResolver(schema), defaultValues: { paymentMethod: 'COD', note: '' } });

  useEffect(() => {
    if (!user) return;
    reset({ customerName: user.fullName || '', email: user.email || '', phone: user.phone || '', address: user.address || '', city: user.city || '', postcode: user.postcode || '', note: '', paymentMethod: 'COD' });
    api.get<CartSummary>('/cart').then((r) => setCart(r.data)).catch(() => setCart({ items: [], count: 0, subtotal: 0 }));
  }, [user, reset]);

  const submit = async (data: CheckoutForm) => {
    setBusy(true); let order: Order | null = null;
    try {
      const result = await api.post<Order>('/orders/checkout', data); order = result.data;
      window.dispatchEvent(new Event('cart-updated'));
      if (data.paymentMethod === 'COD') { show('Order placed successfully'); router.push(`/account/orders/${order.id}`); return; }
      const payment = await api.post(`/payments/sslcommerz/initiate/${order.id}`);
      window.location.href = payment.data.gatewayUrl;
    } catch (e) {
      show(order ? `Order ${order.orderNumber} was created, but payment could not start: ${apiError(e)}` : apiError(e), 'error');
      if (order) router.push(`/account/orders/${order.id}`);
    } finally { setBusy(false); }
  };

  if (authLoading) return <div className="shell py-16"><div className="h-[600px] animate-pulse rounded-[28px] bg-slate-200" /></div>;
  if (!user) return <div className="shell py-20 text-center"><LockKeyhole className="mx-auto h-10 w-10 text-slate-300" /><h1 className="mt-5 text-2xl font-black">Login before checkout</h1><p className="mt-2 text-sm text-slate-500">Your order must belong to an authenticated account.</p><Link href="/login" className="btn-primary mt-6">Login</Link></div>;
  if (cart && !cart.items.length) return <div className="shell py-20 text-center"><h1 className="text-2xl font-black">Your cart is empty</h1><Link href="/products" className="btn-primary mt-6">Shop products</Link></div>;

  const shipping = cart && cart.subtotal >= 3000 ? 0 : 80; const total = (cart?.subtotal || 0) + shipping;
  return <div className="shell py-10 md:py-14"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">SECURE CHECKOUT</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Delivery & payment</h1></div>
    <form onSubmit={handleSubmit(submit)} className="grid gap-7 lg:grid-cols-[1fr_400px]">
      <div className="grid gap-6">
        <section className="rounded-[26px] border border-black/8 bg-white p-6 md:p-8"><div className="mb-6 flex items-center gap-3"><span className="rounded-full bg-violet-100 p-3 text-violet-700"><MapPin className="h-5 w-5" /></span><div><h2 className="text-xl font-black">Delivery details</h2><p className="text-xs text-slate-500">Bangladesh address format</p></div></div><div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.customerName?.message}><input {...register('customerName')} className="input" /></Field>
          <Field label="Email" error={errors.email?.message}><input {...register('email')} type="email" className="input" /></Field>
          <Field label="Phone" error={errors.phone?.message}><input {...register('phone')} placeholder="01712345678" className="input" /></Field>
          <Field label="City / district" error={errors.city?.message}><input {...register('city')} placeholder="Dhaka" className="input" /></Field>
          <div className="sm:col-span-2"><Field label="Full address" error={errors.address?.message}><input {...register('address')} placeholder="House, road, area" className="input" /></Field></div>
          <Field label="Postcode" error={errors.postcode?.message}><input {...register('postcode')} placeholder="1212" className="input" /></Field>
          <div className="sm:col-span-2"><Field label="Order note (optional)" error={errors.note?.message}><textarea {...register('note')} rows={3} placeholder="Delivery instructions..." className="input resize-none" /></Field></div>
        </div></section>
        <section className="rounded-[26px] border border-black/8 bg-white p-6 md:p-8"><div className="mb-6 flex items-center gap-3"><span className="rounded-full bg-violet-100 p-3 text-violet-700"><CreditCard className="h-5 w-5" /></span><div><h2 className="text-xl font-black">Payment method</h2><p className="text-xs text-slate-500">Choose what works for you</p></div></div>
          <div className="grid gap-3"><label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-black/10 p-4 has-[:checked]:border-violet-600 has-[:checked]:bg-violet-50"><input {...register('paymentMethod')} type="radio" value="COD" className="h-4 w-4 accent-violet-600" /><span className="rounded-xl bg-slate-100 p-3"><Truck className="h-5 w-5" /></span><span><b className="block">Cash on Delivery</b><span className="text-xs text-slate-500">Pay when the order arrives.</span></span></label>
          <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-black/10 p-4 has-[:checked]:border-violet-600 has-[:checked]:bg-violet-50"><input {...register('paymentMethod')} type="radio" value="SSLCOMMERZ" className="h-4 w-4 accent-violet-600" /><span className="rounded-xl bg-slate-100 p-3"><CreditCard className="h-5 w-5" /></span><span><b className="block">SSLCOMMERZ</b><span className="text-xs text-slate-500">Sandbox-ready hosted payment gateway. Cards / local channels depend on merchant setup.</span></span></label></div>
        </section>
      </div>
      <aside className="h-fit rounded-[26px] bg-slate-950 p-6 text-white lg:sticky lg:top-24"><h2 className="text-xl font-black">Your order</h2><div className="mt-5 max-h-72 space-y-3 overflow-auto pr-1 hide-scrollbar">{cart?.items.map((item) => <div key={item.id} className="flex items-center gap-3"><img src={item.product.images[0]} alt="" className="h-14 w-14 rounded-xl bg-white/10 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.product.name}</p><p className="text-xs text-white/45">Qty {item.quantity}</p></div></div>)}</div><div className="my-5 h-px bg-white/10" /><div className="grid gap-3 text-sm"><div className="flex justify-between text-white/55"><span>Subtotal</span><span className="text-white">{money(cart?.subtotal || 0)}</span></div><div className="flex justify-between text-white/55"><span>Shipping</span><span className="text-white">{shipping === 0 ? 'Free' : money(shipping)}</span></div><div className="mt-2 flex items-end justify-between"><span className="font-bold">Total</span><span className="text-2xl font-black">{money(total)}</span></div></div><button disabled={busy || !cart?.items.length} className="mt-6 w-full rounded-full bg-white px-5 py-4 text-sm font-black text-slate-950 disabled:opacity-50">{busy ? 'Processing...' : 'Place order'}</button><p className="mt-4 flex gap-2 text-xs leading-5 text-white/45"><LockKeyhole className="mt-0.5 h-4 w-4 flex-none" /> Prices and stock are recalculated on the backend. The browser cannot choose the amount charged by SSLCOMMERZ.</p></aside>
    </form>
  </div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-sm font-bold">{label}</span>{children}{error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}</label>; }
