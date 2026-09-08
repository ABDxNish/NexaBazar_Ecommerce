'use client';

import { useCallback } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  useOrderRealtime,
  OrderRealtimeData,
  OrderRealtimeEvent,
} from '@/lib/useOrderRealtime';

export default function AdminOrderRealtime() {
  const { user, loading } = useAuth();
  const { show } = useToast();

  const handleRealtime = useCallback(
    (
      event: OrderRealtimeEvent,
      data: OrderRealtimeData
    ) => {
      console.log(
        'ADMIN PUSHER EVENT:',
        event,
        data
      );

      if (event === 'order-created') {
        show(
          `New order ${
            data.orderNumber || ''
          }${
            data.customerName
              ? ` from ${data.customerName}`
              : ''
          }`
        );
      }

      if (event === 'order-updated') {
        if (data.paymentStatus === 'PAID') {
          show(
            `Payment received for order ${
              data.orderNumber || ''
            }`
          );
        } else {
          show(
            `Order ${
              data.orderNumber || ''
            }${
              data.status
                ? ` updated to ${data.status}`
                : ' was updated'
            }`
          );
        }
      }

      window.dispatchEvent(
        new CustomEvent(
          'admin-orders-updated',
          {
            detail: {
              event,
              data,
            },
          }
        )
      );
    },
    [show]
  );

  const channel =
    !loading &&
    user?.role === 'ADMIN'
      ? 'admin-orders'
      : null;

  useOrderRealtime(
    channel,
    handleRealtime
  );

  return null;
}