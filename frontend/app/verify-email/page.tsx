'use client';

import {
  Suspense,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  MailCheck,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';

import { api } from '@/lib/api';
import {
  apiError,
} from '@/lib/utils';

import {
  useToast,
} from '@/context/ToastContext';

function VerifyEmailContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const { show } =
    useToast();

  const email =
    searchParams.get(
      'email'
    )?.trim() || '';

  const [
    otp,
    setOtp,
  ] =
    useState('');

  const [
    verifying,
    setVerifying,
  ] =
    useState(false);

  const [
    resending,
    setResending,
  ] =
    useState(false);

  const [
    cooldown,
    setCooldown,
  ] =
    useState(30);

  /*
   * Small resend cooldown to prevent
   * accidental repeated clicks.
   */
  useEffect(() => {
    if (
      cooldown <= 0
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setCooldown(
            (
              previous
            ) =>
              previous - 1
          );
        },
        1000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [cooldown]);

  const verify =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      if (!email) {
        show(
          'Email address is missing. Please register again.',
          'error'
        );

        return;
      }

      if (
        !/^\d{6}$/.test(
          otp
        )
      ) {
        show(
          'Enter the 6-digit verification code',
          'error'
        );

        return;
      }

      setVerifying(
        true
      );

      try {
        await api.post(
          '/auth/verify-email',
          {
            email,
            otp,
          }
        );

        show(
          'Email verified successfully. You can now sign in.'
        );

        router.replace(
          `/login?verified=true&email=${encodeURIComponent(
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
        setVerifying(
          false
        );
      }
    };

  const resend =
    async () => {
      if (
        !email ||
        cooldown > 0 ||
        resending
      ) {
        return;
      }

      setResending(
        true
      );

      try {
        await api.post(
          '/auth/resend-verification',
          {
            email,
          }
        );

        setOtp('');

        setCooldown(
          30
        );

        show(
          'A new verification code has been sent'
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
        setResending(
          false
        );
      }
    };

  const maskedEmail =
    maskEmail(
      email
    );

  if (!email) {
    return (
      <div className="shell py-20">
        <div className="mx-auto max-w-lg rounded-[28px] border border-black/8 bg-white p-8 text-center shadow-sm md:p-10">

          <MailCheck className="mx-auto h-12 w-12 text-slate-300" />

          <h1 className="mt-5 text-2xl font-black">
            Verification email
            missing
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We could not determine
            which account should be
            verified. Please register
            again.
          </p>

          <Link
            href="/register"
            className="btn-primary mt-6 !text-white"
          >
            Back to registration
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="shell py-12 md:py-20">

      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-sm lg:grid-cols-[0.85fr_1.15fr]">

        {/* LEFT */}
        <div className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">

          <div>
            <span className="inline-flex rounded-2xl bg-white/10 p-4">
              <ShieldCheck className="h-7 w-7 !text-violet-300" />
            </span>

            <h2 className="mt-7 text-3xl font-black tracking-[-0.04em] !text-white">
              One quick security
              check.
            </h2>

            <p className="mt-4 text-sm leading-6 !text-white/60">
              We verify your email
              before activating local
              NexaBazar accounts.
            </p>
          </div>

          <p className="text-xs leading-5 !text-white/40">
            Verification codes expire
            after 10 minutes. Requesting
            a new code invalidates the
            previous one.
          </p>

        </div>

        {/* RIGHT */}
        <div className="p-7 md:p-12">

          <div className="mx-auto max-w-md">

            <span className="inline-flex rounded-2xl bg-violet-100 p-3 text-violet-700">
              <MailCheck className="h-6 w-6" />
            </span>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              EMAIL VERIFICATION
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              Enter your code
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              We sent a 6-digit code
              to{' '}
              <strong className="text-slate-800">
                {maskedEmail}
              </strong>
              .
            </p>

            <form
              onSubmit={
                verify
              }
              className="mt-8"
            >

              <label className="block">

                <span className="mb-2 block text-sm font-bold">
                  Verification code
                </span>

                <input
                  value={
                    otp
                  }
                  onChange={(
                    event
                  ) => {
                    const value =
                      event.target.value
                        .replace(
                          /\D/g,
                          ''
                        )
                        .slice(
                          0,
                          6
                        );

                    setOtp(
                      value
                    );
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={
                    6
                  }
                  className="
                    input
                    h-16
                    !px-5
                    text-center
                    !text-2xl
                    font-black
                    tracking-[0.45em]
                  "
                />

              </label>

              <button
                type="submit"
                disabled={
                  verifying ||
                  otp.length !==
                    6
                }
                className="btn-primary mt-5 w-full py-4 !text-white disabled:opacity-50"
              >
                {verifying
                  ? 'Verifying...'
                  : 'Verify account'}
              </button>

            </form>

            <div className="mt-7 border-t border-slate-100 pt-6">

              <p className="text-sm text-slate-500">
                Didn't receive the
                email?
              </p>

              <button
                type="button"
                onClick={
                  resend
                }
                disabled={
                  cooldown >
                    0 ||
                  resending
                }
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  !text-violet-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCcw className="h-4 w-4" />

                {resending
                  ? 'Sending...'
                  : cooldown >
                      0
                    ? `Resend code in ${cooldown}s`
                    : 'Resend code'}
              </button>

            </div>

            <p className="mt-8 text-xs leading-5 text-slate-400">
              Wrong email?{' '}

              <Link
                href="/register"
                className="font-bold !text-violet-600"
              >
                Register again
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="shell py-20">
          <div className="mx-auto h-[500px] max-w-4xl animate-pulse rounded-[30px] bg-slate-200" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function maskEmail(
  email: string
) {
  const [
    local,
    domain,
  ] =
    email.split('@');

  if (
    !local ||
    !domain
  ) {
    return email;
  }

  if (
    local.length <= 2
  ) {
    return `${local[0] || '*'}***@${domain}`;
  }

  return `${local.slice(
    0,
    2
  )}***@${domain}`;
}