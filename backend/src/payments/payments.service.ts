import { BadGatewayException, BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OrdersService } from '../orders/orders.service';
import { PaymentMethod, PaymentStatus } from '../orders/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly config: ConfigService,
    private readonly orders: OrdersService,
  ) {}

  private storeId() {
    const value = this.config.get<string>('SSLCOMMERZ_STORE_ID');
    if (!value) throw new BadRequestException('SSLCOMMERZ_STORE_ID is not configured');
    return value;
  }

  private storePassword() {
    const value = this.config.get<string>('SSLCOMMERZ_STORE_PASSWORD');
    if (!value) throw new BadRequestException('SSLCOMMERZ_STORE_PASSWORD is not configured');
    return value;
  }

  private isLive() {
    return this.config.get<string>('SSLCOMMERZ_IS_LIVE') === 'true';
  }

  private gatewayBase() {
    return this.isLive() ? 'https://securepay.sslcommerz.com' : 'https://sandbox-gw.sslcommerz.com';
  }

  private validatorBase() {
    return this.isLive() ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';
  }

  async initiate(orderId: number, userId: number, role: string) {
    const order = await this.orders.findOneForUser(orderId, userId, role);
    if (order.paymentMethod !== PaymentMethod.SSLCOMMERZ) throw new BadRequestException('This order is not an SSLCOMMERZ order');
    if (order.paymentStatus === PaymentStatus.PAID) throw new BadRequestException('Order is already paid');

    const transactionId = `NB${order.id}${Date.now().toString().slice(-10)}`;
    await this.orders.setTransaction(order.id, transactionId);

    const backend = this.config.get<string>('BACKEND_URL') || 'http://localhost:4000';
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      store_id: this.storeId(),
      store_passwd: this.storePassword(),
      total_amount: order.total.toFixed(2),
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `${backend}/payments/sslcommerz/success`,
      fail_url: `${backend}/payments/sslcommerz/fail`,
      cancel_url: `${backend}/payments/sslcommerz/cancel`,
      ipn_url: `${backend}/payments/sslcommerz/ipn`,
      shipping_method: 'YES',
      product_name: order.items.map((i) => i.productName).join(', ').slice(0, 255),
      product_category: 'E-commerce',
      product_profile: 'general',
      cus_name: order.customerName,
      cus_email: order.email,
      cus_add1: order.address,
      cus_city: order.city,
      cus_postcode: order.postcode,
      cus_country: 'Bangladesh',
      cus_phone: order.phone,
      ship_name: order.customerName,
ship_add1: order.address,
ship_area: order.city,
ship_city: order.city,
ship_sub_city: order.city,
ship_postcode: order.postcode,
ship_country: 'Bangladesh',
      value_a: String(order.id),
      value_b: String(order.user.id),
    };
    Object.entries(values).forEach(([key, value]) => params.append(key, value));

    try {
      const response = await axios.post(`${this.gatewayBase()}/gwprocess/v4/api.php`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 20000,
      });
      if (response.data?.status !== 'SUCCESS' || !response.data?.GatewayPageURL) {
        throw new BadGatewayException(response.data?.failedreason || 'SSLCOMMERZ could not create a payment session');
      }
      return { gatewayUrl: response.data.GatewayPageURL, sessionKey: response.data.sessionkey, transactionId };
    } catch (error: any) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException(error?.response?.data?.failedreason || error?.message || 'Payment gateway connection failed');
    }
  }

  async validate(valId: string, transactionId: string) {
    if (!valId || !transactionId) throw new BadRequestException('Missing payment validation data');
    const order = await this.orders.findByTransactionId(transactionId);
    const response = await axios.get(`${this.validatorBase()}/validator/api/validationserverAPI.php`, {
      params: {
        val_id: valId,
        store_id: this.storeId(),
        store_passwd: this.storePassword(),
        format: 'json',
      },
      timeout: 20000,
    });

    const data = response.data;
    const validStatus = data?.status === 'VALID' || data?.status === 'VALIDATED';
    const sameTransaction = data?.tran_id === transactionId;
    const sameCurrency = data?.currency === 'BDT';
    const sameAmount = Math.abs(Number(data?.amount) - Number(order.total)) < 0.01;

    if (!validStatus || !sameTransaction || !sameCurrency || !sameAmount) {
      throw new ForbiddenException('Payment validation failed: transaction, amount or currency did not match');
    }

    return this.orders.markPaid(transactionId, data);
  }

  async handleSuccess(body: any) {
    return this.validate(body.val_id, body.tran_id);
  }

  async handleIpn(body: any) {
  if (!body?.tran_id) {
    return null;
  }

  if (
    (body.status === 'VALID' ||
      body.status === 'VALIDATED') &&
    body.val_id
  ) {
    return this.validate(
      body.val_id,
      body.tran_id
    );
  }

  if (body.status === 'CANCELLED') {
    return this.orders.markPaymentFailed(
      body.tran_id,
      PaymentStatus.CANCELLED,
      body
    );
  }

  if (
    body.status === 'FAILED' ||
    body.status === 'UNATTEMPTED' ||
    body.status === 'EXPIRED'
  ) {
    return this.orders.markPaymentFailed(
      body.tran_id,
      PaymentStatus.FAILED,
      body
    );
  }

  return null;
}

  async markFailed(body: any, status: PaymentStatus) {
    if (body?.tran_id) return this.orders.markPaymentFailed(body.tran_id, status, body);
    return null;
  }
}
