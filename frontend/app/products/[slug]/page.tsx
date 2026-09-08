'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck, Undo2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { apiError, money, salePrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ProductCarousel from '@/components/ProductCarousel';

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { show } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.get<Product>(`/products/${slug}`).then(async (r) => {
      setProduct(r.data);
      const rel = await api.get('/products', { params: { category: r.data.category.slug, limit: 8 } });
      setRelated(rel.data.items.filter((p: Product) => p.id !== r.data.id));
    }).catch(() => router.push('/products'));
  }, [slug, router]);

  if (!product) return <div className="shell py-16"><div className="h-[650px] animate-pulse rounded-[30px] bg-slate-200" /></div>;
  const price = salePrice(product);

  const requireLogin = () => { show('Please login first', 'error'); router.push('/login'); };
  const addCart = async () => {
    if (!user) return requireLogin();
    setBusy(true);
    try { await api.post('/cart', { productId: product.id, quantity }); window.dispatchEvent(new Event('cart-updated')); show(`${quantity} item(s) added to cart`); }
    catch (e) { show(apiError(e), 'error'); } finally { setBusy(false); }
  };
  const addWishlist = async () => {
    if (!user) return requireLogin();
    try { await api.post('/wishlist', { productId: product.id }); show('Added to wishlist'); } catch (e) { show(apiError(e), 'error'); }
  };

  return <>
    <div className="shell py-8 md:py-12">
      <div className="mb-6 text-sm text-slate-500"><Link href="/products">Products</Link> <span className="mx-2">/</span> <span>{product.category.name}</span> <span className="mx-2">/</span> <span className="text-slate-900">{product.name}</span></div>
      <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
        <div>
          <div className="aspect-square overflow-hidden rounded-[30px] bg-slate-100"><img src={product.images[selected]} alt={product.name} className="h-full w-full object-cover" /></div>
          <div className="mt-4 flex gap-3 overflow-x-auto hide-scrollbar">{product.images.map((img, i) => <button key={img + i} onClick={() => setSelected(i)} className={`h-24 w-24 flex-none overflow-hidden rounded-2xl border-2 ${selected === i ? 'border-violet-600' : 'border-transparent'}`}><img src={img} alt="Product thumbnail" className="h-full w-full object-cover" /></button>)}</div>
        </div>

        <div className="lg:pt-5">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-600">{product.category.name}</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm"><span className="flex items-center gap-1 font-bold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {product.rating}</span><span className="text-slate-400">{product.reviewCount} demo reviews</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span></div>
          <p className="mt-6 text-base leading-7 text-slate-600">{product.shortDescription}</p>
          <div className="mt-7 flex items-end gap-3"><span className="text-3xl font-black">{money(price)}</span>{product.discountPercent > 0 && <><span className="pb-1 text-lg text-slate-400 line-through">{money(product.price)}</span><span className="mb-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">Save {product.discountPercent}%</span></>}</div>

          <div className="mt-8 border-y border-black/8 py-6"><p className="mb-3 text-sm font-bold">Quantity</p><div className="flex items-center gap-3"><div className="flex items-center rounded-full border border-black/10 bg-white"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3"><Minus className="h-4 w-4" /></button><span className="w-10 text-center font-bold">{quantity}</span><button onClick={() => setQuantity(Math.min(Math.min(product.stock, 20), quantity + 1))} className="p-3"><Plus className="h-4 w-4" /></button></div><span className="text-xs text-slate-400">Max 20 per cart item</span></div></div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button disabled={busy || product.stock === 0} onClick={addCart} className="btn-primary flex-1 py-4 disabled:opacity-40"><ShoppingBag className="h-5 w-5" /> Add to cart</button><button onClick={addWishlist} className="btn-secondary px-6 py-4"><Heart className="h-5 w-5" /> Wishlist</button></div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">{[{icon:Truck,title:'Fast delivery',text:'Inside Bangladesh'},{icon:ShieldCheck,title:'Secure checkout',text:'Server validated'},{icon:Undo2,title:'Order tracking',text:'Realtime ready'}].map(({icon:Icon,title,text}) => <div key={title} className="rounded-2xl bg-slate-100 p-4"><Icon className="h-5 w-5 text-violet-600" /><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-1 text-xs text-slate-500">{text}</p></div>)}</div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 rounded-[28px] border border-black/8 bg-white p-7 md:grid-cols-[220px_1fr] md:p-10"><h2 className="text-2xl font-black">Product details</h2><p className="whitespace-pre-line leading-8 text-slate-600">{product.description}</p></div>
    </div>
    {related.length > 0 && <ProductCarousel title="You may also like" subtitle={`More from ${product.category.name}.`} products={related} />}
  </>;
}
