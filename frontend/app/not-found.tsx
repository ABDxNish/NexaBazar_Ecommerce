import Link from 'next/link';
export default function NotFound(){return <div className="shell py-24 text-center"><p className="text-sm font-black text-violet-600">404</p><h1 className="mt-2 text-4xl font-black">Page not found</h1><p className="mt-3 text-slate-500">The page may have moved or the product no longer exists.</p><Link href="/" className="btn-primary mt-7">Back home</Link></div>}
