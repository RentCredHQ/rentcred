import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type NotificationType =
  | 'submission_update'
  | 'report_ready'
  | 'payment_confirmed'
  | 'kyb_update'
  | 'dispute_update'
  | 'field_visit_completed'
  | 'credit_low'
  | 'system';

export interface EmitNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Emit a notification — creates the DB record.
   * Called by other modules when events occur.
   */
  async emit(params: EmitNotificationParams) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data ?? undefined,
      },
    });

    this.logger.log(`Notification sent to ${params.userId}: ${params.type}`);

    return notification;
  }

  /**
   * Emit a notification to multiple users at once.
   */
  async emitToMany(userIds: string[], params: Omit<EmitNotificationParams, 'userId'>) {
    const data = userIds.map((userId) => ({
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data ?? undefined,
    }));

    const result = await this.prisma.notification.createMany({ data });

    this.logger.log(`Notification sent to ${userIds.length} users: ${params.type}`);

    return result;
  }

  /**
   * List notifications for a user with pagination and unread filter.
   */
  async findAll(userId: string, options?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (options?.unreadOnly) {
      where.readAt = null;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);

    return {
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark a single notification as read with ownership check.
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Not your notification');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { markedCount: result.count };
  }

  /**
   * Delete a notification with ownership check.
   */
  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Not your notification');
    }

    await this.prisma.notification.delete({ where: { id } });

    return { message: 'Notification deleted' };
  }
}
