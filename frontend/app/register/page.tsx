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
  Phone,
  UserRound,
} from 'lucide-react';

import { useState } from 'react';

import { api, API_URL } from '@/lib/api';
import { apiError } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

const schema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(
        3,
        'Full name must be at least 3 characters'
      )
      .max(100)
      .regex(
        /^[A-Za-z .'-]+$/,
        'Use letters, spaces, apostrophes, dots or hyphens only'
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        'Enter a valid email address'
      )
      .max(150),

    phone: z
      .string()
      .trim()
      .regex(
        /^(?:\+?88)?01[3-9]\d{8}$/,
        'Use a valid Bangladeshi number, e.g. 01712345678'
      ),

    password: z
      .string()
      .min(
        8,
        'Minimum 8 characters'
      )
      .max(72)
      .regex(
        /[A-Z]/,
        'Add at least one uppercase letter'
      )
      .regex(
        /[a-z]/,
        'Add at least one lowercase letter'
      )
      .regex(
        /\d/,
        'Add at least one number'
      )
      .regex(
        /[^A-Za-z0-9]/,
        'Add at least one special character'
      ),

    confirmPassword:
      z.string(),

    terms: z
      .boolean()
      .refine(
        (value) => value,
        'You must accept the terms'
      ),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: [
        'confirmPassword',
      ],
      message:
        'Passwords do not match',
    }
  );

type FormData =
  z.infer<typeof schema>;

type RegisterResponse = {
  message: string;
  email: string;
  requiresVerification: boolean;
  emailSent: boolean;
};

export default function RegisterPage() {
  const router =
    useRouter();

  const { show } =
    useToast();

  const [
    visible,
    setVisible,
  ] =
    useState(false);

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } =
    useForm<FormData>({
      resolver:
        zodResolver(
          schema
        ),

      defaultValues: {
        terms: false,
      },
    });

  const submit =
    async (
      data: FormData
    ) => {
      setBusy(true);

      try {
        const {
          terms,
          ...payload
        } = data;

        const response =
          await api.post<RegisterResponse>(
            '/auth/register',
            payload
          );

        const email =
          response.data
            .email ||
          payload.email;

        if (
          response.data
            .emailSent
        ) {
          show(
            'Verification code sent to your email'
          );
        } else {
          show(
            'Account created. Verification email could not be sent, so use Resend Code on the next page.',
            'error'
          );
        }

        router.push(
          `/verify-email?email=${encodeURIComponent(
            email
          )}`
        );
      } catch (
        error
      ) {
        show(
          apiError(
            error
          ),
          'error'
        );
      } finally {
        setBusy(
          false
        );
      }
    };

  return (
    <div className="shell py-8 md:py-12">
      <div className="grid min-h-[720px] overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">

        {/* LEFT VISUAL */}
        <div className="relative hidden overflow-hidden bg-[#401827] lg:block">

          <img
            src="/images/hero/hero-2.png"
            alt="NexaBazar register visual"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-[72%_center]
            "
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#260b17]/90 via-[#260b17]/10 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 z-10 p-10">

            <p className="text-xs font-bold uppercase tracking-[0.2em] !text-white/65">
              CREATE YOUR ACCOUNT
            </p>

            <h1 className="mt-3 max-w-md text-4xl font-black tracking-[-0.04em] !text-white">
              Wishlist it. Cart it.
              Track it.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 !text-white/70">
              Create your account,
              verify your email with a
              secure one-time code, and
              then start shopping.
            </p>

          </div>
        </div>

        {/* FORM */}
        <div className="flex items-center justify-center p-6 md:p-12">

          <div className="w-full max-w-xl">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              NEXABAZAR
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em]">
              Create an account
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Already registered?{' '}

              <Link
                href="/login"
                className="font-bold !text-violet-600"
              >
                Sign in
              </Link>
            </p>

            <form
              onSubmit={
                handleSubmit(
                  submit
                )
              }
              className="mt-8 grid gap-4"
            >

              {/* FULL NAME */}
              <Field
                label="Full name"
                error={
                  errors
                    .fullName
                    ?.message
                }
                icon={
                  <UserRound className="h-4 w-4" />
                }
              >
                <input
                  {...register(
                    'fullName'
                  )}
                  type="text"
                  autoComplete="name"
                  placeholder="Nafis Hasan"
                  className={`
                    input
                    !pl-12
                    !pr-4
                    ${
                      errors
                        .fullName
                        ? 'input-error'
                        : ''
                    }
                  `}
                />
              </Field>

              {/* EMAIL */}
              <Field
                label="Email"
                error={
                  errors
                    .email
                    ?.message
                }
                icon={
                  <Mail className="h-4 w-4" />
                }
              >
                <input
                  {...register(
                    'email'
                  )}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`
                    input
                    !pl-12
                    !pr-4
                    ${
                      errors
                        .email
                        ? 'input-error'
                        : ''
                    }
                  `}
                />
              </Field>

              {/* PHONE */}
              <Field
                label="Bangladeshi phone"
                error={
                  errors
                    .phone
                    ?.message
                }
                icon={
                  <Phone className="h-4 w-4" />
                }
              >
                <input
                  {...register(
                    'phone'
                  )}
                  type="tel"
                  autoComplete="tel"
                  placeholder="01712345678"
                  className={`
                    input
                    !pl-12
                    !pr-4
                    ${
                      errors
                        .phone
                        ? 'input-error'
                        : ''
                    }
                  `}
                />
              </Field>

              {/* PASSWORDS */}
              <div className="grid gap-4 sm:grid-cols-2">

                <Field
                  label="Password"
                  error={
                    errors
                      .password
                      ?.message
                  }
                  icon={
                    <LockKeyhole className="h-4 w-4" />
                  }
                >
                  <input
                    {...register(
                      'password'
                    )}
                    type={
                      visible
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    placeholder="Strong password"
                    className={`
                      input
                      !pl-12
                      !pr-12
                      ${
                        errors
                          .password
                          ? 'input-error'
                          : ''
                      }
                    `}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setVisible(
                        (
                          previous
                        ) =>
                          !previous
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
                </Field>

                <Field
                  label="Confirm password"
                  error={
                    errors
                      .confirmPassword
                      ?.message
                  }
                  icon={
                    <LockKeyhole className="h-4 w-4" />
                  }
                >
                  <input
                    {...register(
                      'confirmPassword'
                    )}
                    type={
                      visible
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    className={`
                      input
                      !pl-12
                      !pr-4
                      ${
                        errors
                          .confirmPassword
                          ? 'input-error'
                          : ''
                      }
                    `}
                  />
                </Field>

              </div>

              {/* TERMS */}
              <label className="flex items-start gap-3 text-sm text-slate-600">

                <input
                  type="checkbox"
                  {...register(
                    'terms'
                  )}
                  className="mt-1 h-4 w-4 shrink-0 accent-violet-600"
                />

                <span>
                  I agree to the demo
                  store terms and
                  understand this is a
                  portfolio e-commerce
                  project.
                </span>

              </label>

              {errors
                .terms && (
                <p className="-mt-2 text-xs font-medium text-rose-600">
                  {
                    errors
                      .terms
                      .message
                  }
                </p>
              )}

              {/* REGISTER */}
              <button
                type="submit"
                disabled={
                  busy
                }
                className="btn-primary mt-2 w-full py-4 !text-white disabled:opacity-50"
              >
                {busy
                  ? 'Creating account...'
                  : 'Create account'}
              </button>

            </form>

            {/* DIVIDER */}
            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">

              <div className="h-px flex-1 bg-slate-200" />

              <span>
                OR
              </span>

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

            <p className="mt-5 text-xs leading-5 text-slate-400">
              Local accounts require
              email verification before
              login. Google authenticated
              accounts do not require a
              separate OTP verification
              step.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-sm font-bold">
        {label}
      </span>

      <div className="relative">

        <span
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            z-10
            flex
            -translate-y-1/2
            items-center
            justify-center
            text-slate-400
          "
        >
          {icon}
        </span>

        {children}

      </div>

      {error && (
        <span className="mt-1.5 block text-xs font-medium text-rose-600">
          {error}
        </span>
      )}

    </label>
  );
}