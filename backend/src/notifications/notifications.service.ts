import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher = require('pusher');

@Injectable()
export class NotificationsService {
  private pusher: Pusher | null = null;

  constructor(private readonly config: ConfigService) {
    const appId = config.get<string>('PUSHER_APP_ID');
    const key = config.get<string>('PUSHER_KEY');
    const secret = config.get<string>('PUSHER_SECRET');
    if (appId && key && secret) {
      this.pusher = new Pusher({
        appId,
        key,
        secret,
        cluster: config.get<string>('PUSHER_CLUSTER') || 'ap2',
        useTLS: true,
      });
    }
  }

  async orderCreated(order: any) {
    if (!this.pusher) return;
    await this.pusher.trigger('admin-orders', 'order-created', {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      customerName: order.customerName,
      status: order.status,
    });
  }

  async orderUpdated(order: any) {
    if (!this.pusher) return;
    await Promise.all([
      this.pusher.trigger('admin-orders', 'order-updated', {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
      }),
      this.pusher.trigger(`user-${order.user.id}`, 'order-updated', {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
      }),
    ]);
  }
}
