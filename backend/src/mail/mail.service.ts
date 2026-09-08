import {
  Injectable,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  MailerService,
} from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly mailer:
      MailerService,

    private readonly config:
      ConfigService,
  ) {}

  private enabled() {
    return (
      this.config.get<string>(
        'MAIL_ENABLED',
      ) === 'true'
    );
  }

  /*
   * ============================
   * EMAIL VERIFICATION OTP
   * ============================
   */

  async sendVerificationOtp(
    email: string,
    name: string,
    otp: string,
  ) {
    if (!this.enabled()) {
      return;
    }

    await this.mailer.sendMail({
      to: email,

      subject:
        'Verify your NexaBazar account',

      text: `
Hello ${name},

Your NexaBazar email verification code is:

${otp}

This code will expire in 10 minutes.

If you did not create a NexaBazar account, you can safely ignore this email.

NexaBazar
      `.trim(),

      html: `
        <div
          style="
            max-width: 520px;
            margin: 0 auto;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: #0f172a;
          "
        >
          <h2
            style="
              margin-bottom: 8px;
              color: #111827;
            "
          >
            Verify your NexaBazar account
          </h2>

          <p>
            Hello ${name},
          </p>

          <p>
            Use the verification code below
            to verify your email address.
          </p>

          <div
            style="
              margin: 28px 0;
              padding: 20px;
              text-align: center;
              border-radius: 14px;
              background: #f5f3ff;
              font-size: 32px;
              font-weight: 800;
              letter-spacing: 8px;
              color: #6d28d9;
            "
          >
            ${otp}
          </div>

          <p>
            This code expires in
            <strong>10 minutes</strong>.
          </p>

          <p
            style="
              margin-top: 28px;
              font-size: 13px;
              color: #64748b;
            "
          >
            If you did not create a
            NexaBazar account, you can
            safely ignore this email.
          </p>

          <p
            style="
              margin-top: 24px;
              font-weight: 700;
            "
          >
            NexaBazar
          </p>
        </div>
      `,
    });
  }

  /*
   * ============================
   * WELCOME EMAIL
   * ============================
   */

  async sendWelcome(
    email: string,
    name: string,
  ) {
    if (!this.enabled()) {
      return;
    }

    await this.mailer.sendMail({
      to: email,

      subject:
        'Welcome to NexaBazar',

      text:
        `Hello ${name}, welcome to NexaBazar. ` +
        'Your email has been verified and your account is ready.',

      html: `
        <div
          style="
            max-width: 520px;
            margin: 0 auto;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: #0f172a;
          "
        >
          <h2>
            Welcome to NexaBazar 🎉
          </h2>

          <p>
            Hello ${name},
          </p>

          <p>
            Your email has been verified
            successfully and your
            NexaBazar account is ready.
          </p>

          <p>
            You can now login and start
            shopping.
          </p>

          <p
            style="
              margin-top: 24px;
              font-weight: 700;
            "
          >
            NexaBazar
          </p>
        </div>
      `,
    });
  }

  /*
   * ============================
   * ORDER CREATED
   * ============================
   */

  async sendOrderCreated(
    email: string,
    name: string,
    orderNumber: string,
    total: number,
  ) {
    if (!this.enabled()) {
      return;
    }

    await this.mailer.sendMail({
      to: email,

      subject:
        `Order ${orderNumber} received`,

      text:
        `Hello ${name}, ` +
        `we received your order ${orderNumber}. ` +
        `Total: BDT ${total.toFixed(2)}.`,

      html: `
        <div
          style="
            max-width: 520px;
            margin: 0 auto;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: #0f172a;
          "
        >
          <h2>
            Order received
          </h2>

          <p>
            Hello ${name},
          </p>

          <p>
            We received your order:
          </p>

          <p
            style="
              font-size: 18px;
              font-weight: 700;
            "
          >
            ${orderNumber}
          </p>

          <p>
            Total:
            <strong>
              BDT ${total.toFixed(2)}
            </strong>
          </p>

          <p>
            You will receive another
            email when your order status
            changes.
          </p>

          <p
            style="
              margin-top: 24px;
              font-weight: 700;
            "
          >
            NexaBazar
          </p>
        </div>
      `,
    });
  }

  /*
   * ============================
   * ORDER STATUS
   * ============================
   */

  async sendOrderStatus(
    email: string,
    name: string,
    orderNumber: string,
    status: string,
  ) {
    if (!this.enabled()) {
      return;
    }

    const readableStatus =
      status
        .replace(/_/g, ' ')
        .toLowerCase();

    await this.mailer.sendMail({
      to: email,

      subject:
        `Order ${orderNumber}: ${status}`,

      text:
        `Hello ${name}, ` +
        `your order ${orderNumber} ` +
        `is now ${readableStatus}.`,

      html: `
        <div
          style="
            max-width: 520px;
            margin: 0 auto;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: #0f172a;
          "
        >
          <h2>
            Order status updated
          </h2>

          <p>
            Hello ${name},
          </p>

          <p>
            Your order:
          </p>

          <p
            style="
              font-size: 18px;
              font-weight: 700;
            "
          >
            ${orderNumber}
          </p>

          <p>
            is now
            <strong>
              ${readableStatus}
            </strong>.
          </p>

          <p
            style="
              margin-top: 24px;
              font-weight: 700;
            "
          >
            NexaBazar
          </p>
        </div>
      `,
    });
  }
}