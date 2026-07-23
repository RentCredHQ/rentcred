import { Module } from '@nestjs/common';
import { FieldAgentsController } from './field-agents.controller';
import { FieldAgentsService } from './field-agents.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { VerificationModule } from '../verification/verification.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [NotificationsModule, AuditModule, VerificationModule, MailModule],
  controllers: [FieldAgentsController],
  providers: [FieldAgentsService],
  exports: [FieldAgentsService],
})
export class FieldAgentsModule {}
