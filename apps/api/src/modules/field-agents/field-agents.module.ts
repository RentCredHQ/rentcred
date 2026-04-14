import { Module } from '@nestjs/common';
import { FieldAgentsController } from './field-agents.controller';
import { FieldAgentsService } from './field-agents.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [NotificationsModule, AuditModule],
  controllers: [FieldAgentsController],
  providers: [FieldAgentsService],
  exports: [FieldAgentsService],
})
export class FieldAgentsModule {}
