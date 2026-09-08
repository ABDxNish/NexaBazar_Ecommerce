'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react';

import { useState } from 'react';

import { api, API_URL } from '@/lib/api';
import { apiError } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

const bdPhone = /^(?:\+?88)?01[3-9]\d{8}$/;

const schema = z.object({
  identifier: z
    .string()
    .trim()
    .min(5, 'Enter your email or Bangladeshi phone number')
    .refine(
      (value) =>
        z.string().email().safeParse(value).success ||
        bdPhone.test(value),
      'Use a valid email or Bangladeshi phone number'
    ),

  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(72),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();

  const { show } = useToast();
  const { refresh } = useAuth();

  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submit = async (data: FormData) => {
    setBusy(true);

    try {
      await api.post('/auth/login', data);

      await refresh();

      window.dispatchEvent(
        new Event('cart-updated')
      );

      show('Welcome back');

      router.push('/account');
    } catch (error) {
      show(apiError(error), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell py-8 md:py-12">
      <div className="grid min-h-[650px] overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-sm lg:grid-cols-2">

        {/* ==============================
            LEFT SIDE - LOGIN FORM
        ============================== */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-lg">

            <p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">
              WELCOME BACK
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">
              Sign in to NexaBazar
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              Use either your registered email or Bangladeshi phone number.
            </p>

            <form
              onSubmit={handleSubmit(submit)}
              className="mt-8 grid gap-5"
            >

              {/* EMAIL / PHONE */}
              <label>
                <span className="mb-1.5 block text-sm font-bold">
                  Email or phone
                </span>

                <div className="relative">

                  <Mail
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      z-10
                      h-4
                      w-4
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    {...register('identifier')}
                    type="text"
                    autoComplete="username"
                    placeholder="you@example.com or 01712345678"
                    className={`
                      input
                      !pl-12
                      !pr-4
                      ${
                        errors.identifier
                          ? 'input-error'
                          : ''
                      }
                    `}
                  />
                </div>

                {errors.identifier && (
                  <span className="mt-1.5 block text-xs font-medium text-rose-600">
                    {errors.identifier.message}
                  </span>
                )}
              </label>

              {/* PASSWORD */}
              <label>
                <span className="mb-1.5 block text-sm font-bold">
                  Password
                </span>

                <div className="relative">

                  <LockKeyhole
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      z-10
                      h-4
                      w-4
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    {...register('password')}
                    type={
                      visible
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    placeholder="Your password"
                    className={`
                      input
                      !pl-12
                      !pr-12
                      ${
                        errors.password
                          ? 'input-error'
                          : ''
                      }
                    `}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setVisible(
                        (previous) => !previous
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      z-20
                      -translate-y-1/2
                      rounded-full
                      p-1.5
                      text-slate-400
                      transition
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                    aria-label={
                      visible
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <span className="mt-1.5 block text-xs font-medium text-rose-600">
                    {errors.password.message}
                  </span>
                )}
              </label>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full py-4 disabled:opacity-50"
              >
                {busy
                  ? 'Signing in...'
                  : 'Sign in'}
              </button>
            </form>

            {/* DIVIDER */}
            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />

              <span>OR</span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* GOOGLE */}
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  `${API_URL}/auth/google`;
              }}
              className="btn-secondary w-full py-3.5"
            >
              <span className="text-lg font-black text-blue-600">
                G
              </span>

              Continue with Google
            </button>

            {/* REGISTER */}
            <p className="mt-6 text-center text-sm text-slate-500">
              New here?{' '}

              <Link
                href="/register"
                className="font-bold text-violet-600"
              >
                Create account
              </Link>
            </p>

            {/* DEMO ADMIN */}
            <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
              <b>Seeded admin:</b>{' '}
              admin@nexabazar.com / Admin@12345
              {' '}
              (after running{' '}
              <code>npm run seed</code>{' '}
              in backend).
            </div>

          </div>
        </div>

        {/* ==============================
            RIGHT SIDE
        ============================== */}
        <div className="relative hidden overflow-hidden bg-slate-950 lg:block">

          <img
            src="/images/hero/hero-5.png"
            alt="NexaBazar login visual"
            className="absolute inset-0 h-full w-full object-cover object-[99%_center]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-10 left-10 right-10 rounded-[24px] border border-white/15 bg-black/20 p-6 text-white backdrop-blur">

            <p className="text-sm font-bold">
              Session-based authentication
            </p>

            <p className="mt-2 text-sm leading-6 text-white/65">
              The backend stores your user ID and role
              in an HTTP-only session cookie.
              Protected APIs still verify authorization
              even if someone bypasses the frontend.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}