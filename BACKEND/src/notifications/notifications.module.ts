import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';

import {
  USER_INVITATION_QUEUE,
  USER_INVITATION_QUEUE_NAME,
} from './notification.tokens';
import { ConsoleMailProvider } from './mail/console-mail.provider';
import type { InvitationEmailJob } from '../types/notifications/invitationEmailJob';

@Module({
  imports: [ConfigModule],
  providers: [
    ConsoleMailProvider,
    {
      provide: USER_INVITATION_QUEUE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Queue<InvitationEmailJob> => {
        const redisHost = configService.get<string>('REDIS_HOST', '127.0.0.1');
        const redisPort = Number(
          configService.get<string | number>('REDIS_PORT', 6379),
        );
        const redisPassword =
          configService.get<string | undefined>('REDIS_PASSWORD');

        const connection = {
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          // requisito do BullMQ para comandos blocking
          maxRetriesPerRequest: null as unknown as number | null,
        };

        return new Queue<InvitationEmailJob>(USER_INVITATION_QUEUE_NAME, {
          connection,
        });
      },
    },
    {
      provide: 'USER_INVITATION_WORKER',
      inject: [ConfigService, ConsoleMailProvider],
      useFactory: (
        configService: ConfigService,
        mailProvider: ConsoleMailProvider,
      ): Worker<InvitationEmailJob> => {
        const redisHost = configService.get<string>('REDIS_HOST', '127.0.0.1');
        const redisPort = Number(
          configService.get<string | number>('REDIS_PORT', 6379),
        );
        const redisPassword =
          configService.get<string | undefined>('REDIS_PASSWORD');

        const connection = {
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          maxRetriesPerRequest: null as unknown as number | null,
        };

        const worker = new Worker<InvitationEmailJob>(
          USER_INVITATION_QUEUE_NAME,
          async (job) => {
            await mailProvider.sendInvitationEmail({
              toEmail: job.data.email,
              toName: job.data.name,
              organizationName: job.data.organizationName,
              invitationToken: job.data.invitationToken,
            });
          },
          {
            connection,
          },
        );

        return worker;
      },
    },
  ],
  exports: [USER_INVITATION_QUEUE],
})
export class NotificationsModule {}
