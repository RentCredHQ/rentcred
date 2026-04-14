import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

export interface EmailJobData {
  type: 'password-reset' | 'email-verification' | 'welcome' | 'notification';
  to: string;
  name: string;
  token?: string;
  subject?: string;
  html?: string;
}

export interface NotificationJobData {
  type: 'push-notification';
  userId: string;
  notificationType: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export type JobData = EmailJobData | NotificationJobData;

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private emailQueue: Queue;
  private emailWorker: Worker;

  constructor(private mailService: MailService) {
    // Email queue
    this.emailQueue = new Queue('email', { connection: redisConnection });

    // Email worker
    this.emailWorker = new Worker(
      'email',
      async (job: Job<EmailJobData>) => {
        await this.processEmailJob(job);
      },
      {
        connection: redisConnection,
        concurrency: 5,
        limiter: { max: 10, duration: 1000 }, // 10 emails/sec
      },
    );

    this.emailWorker.on('completed', (job) => {
      this.logger.log(`Email job ${job.id} completed (${job.data.type})`);
    });

    this.emailWorker.on('failed', (job, error) => {
      this.logger.error(`Email job ${job?.id} failed: ${error.message}`);
    });
  }

  private async processEmailJob(job: Job<EmailJobData>) {
    const { type, to, name, token } = job.data;

    switch (type) {
      case 'password-reset':
        await this.mailService.sendPasswordReset(to, name, token!);
        break;
      case 'email-verification':
        await this.mailService.sendEmailVerification(to, name, token!);
        break;
      case 'welcome':
        await this.mailService.sendWelcome(to, name);
        break;
      default:
        this.logger.warn(`Unknown email job type: ${type}`);
    }
  }

  /**
   * Add an email job to the queue.
   */
  async addEmailJob(data: EmailJobData, opts?: { delay?: number }) {
    return this.emailQueue.add(data.type, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 500,
      ...opts,
    });
  }

  async onModuleDestroy() {
    await this.emailWorker?.close();
    await this.emailQueue?.close();
  }
}
