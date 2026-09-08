import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  MailerModule,
} from '@nestjs-modules/mailer';

import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,

    MailerModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        config: ConfigService,
      ) => {
        const enabled =
          config.get<string>(
            'MAIL_ENABLED',
          ) === 'true';

        const provider =
          config.get<string>(
            'MAIL_PROVIDER',
          ) || 'brevo';

        const senderEmail =
          config.get<string>(
            'BREVO_SENDER_EMAIL',
          ) ||
          'no-reply@nexabazar.local';

        const senderName =
          config.get<string>(
            'BREVO_SENDER_NAME',
          ) ||
          'NexaBazar';

        /*
         * Development fallback:
         * mail will not actually be sent
         * when MAIL_ENABLED is false.
         */
        if (!enabled) {
          return {
            transport: {
              streamTransport: true,
              newline: 'unix',
              buffer: true,
            },

            defaults: {
              from:
                `"${senderName}" <${senderEmail}>`,
            },
          } as any;
        }

        /*
         * Brevo SMTP
         */
        if (provider === 'brevo') {
          const smtpUser =
            config.get<string>(
              'BREVO_SMTP_USER',
            );

          const smtpKey =
            config.get<string>(
              'BREVO_SMTP_KEY',
            );

          if (
            !smtpUser ||
            !smtpKey
          ) {
            throw new Error(
              'Brevo SMTP credentials are missing',
            );
          }

          return {
            transport: {
              host:
                config.get<string>(
                  'BREVO_SMTP_HOST',
                ) ||
                'smtp-relay.brevo.com',

              port: Number(
                config.get<string>(
                  'BREVO_SMTP_PORT',
                ) ||
                  587,
              ),

              /*
               * Port 587 uses STARTTLS,
               * therefore secure is false.
               */
              secure: false,

              auth: {
                user: smtpUser,
                pass: smtpKey,
              },
            },

            defaults: {
              from:
                `"${senderName}" <${senderEmail}>`,
            },
          } as any;
        }

        throw new Error(
          `Unsupported mail provider: ${provider}`,
        );
      },
    }),
  ],

  providers: [
    MailService,
  ],

  exports: [
    MailService,
  ],
})
export class MailModule {}