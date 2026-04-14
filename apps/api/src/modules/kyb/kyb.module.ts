import { Module } from '@nestjs/common';
import { KybController } from './kyb.controller';
import { KybService } from './kyb.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [NotificationsModule, AuditModule],
  controllers: [KybController],
  providers: [KybService],
  exports: [KybService],
})
export class KybModule {}
