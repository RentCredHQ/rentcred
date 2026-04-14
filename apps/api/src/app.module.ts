import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './modules/mail/mail.module';
import { QueueModule } from './modules/queue/queue.module';
import { UploadModule } from './modules/upload/upload.module';
import { AuthModule } from './modules/auth/auth.module';
import { AgentsModule } from './modules/agents/agents.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { KybModule } from './modules/kyb/kyb.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AuditModule } from './modules/audit/audit.module';
import { FieldAgentsModule } from './modules/field-agents/field-agents.module';
import { VerificationModule } from './modules/verification/verification.module';
import { OpsModule } from './modules/ops/ops.module';
import { HealthModule } from './modules/health/health.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    // Rate limiting: 100 requests per minute globally
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000, // Convert to ms
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),
    PrismaModule,
    MailModule,
    QueueModule,
    UploadModule,
    AuthModule,
    AgentsModule,
    TenantsModule,
    SubmissionsModule,
    ReportsModule,
    PaymentsModule,
    NotificationsModule,
    KybModule,
    DisputesModule,
    AuditModule,
    FieldAgentsModule,
    VerificationModule,
    OpsModule,
    HealthModule,
    ReviewsModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
