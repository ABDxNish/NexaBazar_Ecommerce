import type { Metadata } from 'next';

import './globals.css';

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import AdminOrderRealtime from '@/components/AdminOrderRealtime';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomerOrderRealtime from '@/components/CustomerOrderRealtime';

export const metadata: Metadata = {
  title:
    'NexaBazar — Modern shopping for Bangladesh',

  description:
    'A full-stack Next.js + NestJS e-commerce demo with SSLCOMMERZ, PostgreSQL and session authentication.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
       <AuthProvider>
  <ToastProvider>

    <CustomerOrderRealtime />
    <AdminOrderRealtime />

    <Navbar />

    <main className="min-h-[70vh]">
      {children}
    </main>

    <Footer />

  </ToastProvider>
</AuthProvider>
      </body>
    </html>
  );
}