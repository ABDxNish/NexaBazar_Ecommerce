'use client';

import { useCallback } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useOrderRealtime } from '@/lib/useOrderRealtime';

type RealtimeOrderData = {
  id?: number;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
};

export default function CustomerOrderRealtime() {
  const {
    user,
    loading,
  } = useAuth();

  const { show } = useToast();

  const handleRealtime =
    useCallback(
      (
        event:
          | 'order-created'
          | 'order-updated',
        data: RealtimeOrderData
      ) => {
        console.log(
          'CUSTOMER PUSHER EVENT:',
          event,
          data
        );

        /*
         * Customer currently only receives
         * order-updated from backend.
         */
        if (
          event ===
          'order-updated'
        ) {
          const readableStatus =
            data.status
              ?.replace(
                /_/g,
                ' '
              )
              .toLowerCase();

          show(
            `Order ${
              data.orderNumber || ''
            } ${
              readableStatus
                ? `is now ${readableStatus}`
                : 'was updated'
            }`
          );
        }

        /*
         * Tell My Orders / Order Details
         * page to refresh its data.
         */
        window.dispatchEvent(
          new CustomEvent(
            'customer-orders-updated',
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
    user &&
    user.role !== 'ADMIN'
      ? `user-${user.id}`
      : null;

  useOrderRealtime(
    channel,
    handleRealtime
  );

  return null;
}