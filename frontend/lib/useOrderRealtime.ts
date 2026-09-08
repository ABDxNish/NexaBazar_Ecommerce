'use client';

import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

export type OrderRealtimeEvent =
  | 'order-created'
  | 'order-updated';

export type OrderRealtimeData = {
  id?: number;
  orderNumber?: string;
  total?: number;
  customerName?: string;
  status?: string;
  paymentStatus?: string;
};

export function useOrderRealtime(
  channelName: string | null,
  onUpdate: (
    event: OrderRealtimeEvent,
    data: OrderRealtimeData
  ) => void
) {
  /*
   * Keep latest callback without reconnecting
   * Pusher every time component rerenders.
   */
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const key =
      process.env.NEXT_PUBLIC_PUSHER_KEY;

    const cluster =
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER ||
      'ap2';

    if (!key) {
      console.error(
        '❌ NEXT_PUBLIC_PUSHER_KEY is missing'
      );
      return;
    }

    if (!channelName) {
      return;
    }

    console.log(
      `🔌 Starting Pusher subscription: ${channelName}`
    );

    const pusher = new Pusher(key, {
      cluster,
    });

    pusher.connection.bind(
      'connected',
      () => {
        console.log(
          '✅ Pusher connected',
          pusher.connection.socket_id
        );
      }
    );

    pusher.connection.bind(
      'error',
      (error: unknown) => {
        console.error(
          '❌ Pusher connection error',
          error
        );
      }
    );

    const channel =
      pusher.subscribe(channelName);

    channel.bind(
      'pusher:subscription_succeeded',
      () => {
        console.log(
          `✅ Subscribed: ${channelName}`
        );
      }
    );

    const createdHandler = (
      data: OrderRealtimeData
    ) => {
      console.log(
        '🔔 order-created received',
        data
      );

      callbackRef.current(
        'order-created',
        data
      );
    };

    const updatedHandler = (
      data: OrderRealtimeData
    ) => {
      console.log(
        '🔄 order-updated received',
        data
      );

      callbackRef.current(
        'order-updated',
        data
      );
    };

    channel.bind(
      'order-created',
      createdHandler
    );

    channel.bind(
      'order-updated',
      updatedHandler
    );

    return () => {
      channel.unbind(
        'order-created',
        createdHandler
      );

      channel.unbind(
        'order-updated',
        updatedHandler
      );

      pusher.unsubscribe(
        channelName
      );

      pusher.disconnect();

      console.log(
        `🔌 Unsubscribed: ${channelName}`
      );
    };
  }, [channelName]);
}