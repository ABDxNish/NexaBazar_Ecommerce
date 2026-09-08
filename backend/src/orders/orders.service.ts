import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { OrderEntity, OrderStatus, PaymentMethod, PaymentStatus } from './order.entity';
import { OrderItemEntity } from './order-item.entity';
import { CartItemEntity } from '../cart/cart-item.entity';
import { UserEntity, UserRole } from '../users/user.entity';
import { ProductEntity } from '../products/product.entity';
import { CheckoutDto } from './dto/order.dto';
import { normalizeBdPhone } from '../common/utils/phone.util';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
  ) {}

  private makeOrderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `NB-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  async checkout(userId: number, dto: CheckoutDto) {
    const order = await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(UserEntity, { where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const cart = await manager.find(CartItemEntity, { where: { user: { id: userId } }, relations: ['product', 'product.category'] });
      if (!cart.length) throw new BadRequestException('Your cart is empty');

      let subtotal = 0;
      const orderItems: OrderItemEntity[] = [];
      for (const cartItem of cart) {
        const product = cartItem.product;
        if (cartItem.quantity > product.stock) {
          throw new BadRequestException(`${product.name} has only ${product.stock} item(s) left`);
        }
        const unitPrice = Number((product.price * (1 - product.discountPercent / 100)).toFixed(2));
        subtotal += unitPrice * cartItem.quantity;
        orderItems.push(manager.create(OrderItemEntity, {
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: cartItem.quantity,
          image: product.images?.[0] || null,
        }));
        product.stock -= cartItem.quantity;
        await manager.save(product);
      }

      subtotal = Number(subtotal.toFixed(2));
      const shippingFee = subtotal >= 3000 ? 0 : 80;
      const total = Number((subtotal + shippingFee).toFixed(2));

      const created = manager.create(OrderEntity, {
        orderNumber: this.makeOrderNumber(),
        user,
        status: dto.paymentMethod === PaymentMethod.COD ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
        paymentMethod: dto.paymentMethod,
        paymentStatus: dto.paymentMethod === PaymentMethod.COD ? PaymentStatus.UNPAID : PaymentStatus.PENDING,
        subtotal,
        shippingFee,
        total,
        customerName: dto.customerName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: normalizeBdPhone(dto.phone),
        address: dto.address.trim(),
        city: dto.city.trim(),
        postcode: dto.postcode,
        note: dto.note?.trim() || null,
      });

      const saved = await manager.save(OrderEntity, created);
      orderItems.forEach((item) => (item.order = saved));
      await manager.save(OrderItemEntity, orderItems);
      await manager.createQueryBuilder().delete().from(CartItemEntity).where('"userId" = :userId', { userId }).execute();
      const complete = await manager.findOne(OrderEntity, { where: { id: saved.id } });
      return complete!;
    });

    await this.notifications.orderCreated(order);
    await this.mail.sendOrderCreated(order.email, order.customerName, order.orderNumber, order.total);
    return order;
  }

  findMine(userId: number) {
    return this.orders.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  findAll() {
    return this.orders.find({ order: { createdAt: 'DESC' } });
  }

  async findOneForUser(id: number, userId: number, role: string) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (role !== UserRole.ADMIN && order.user.id !== userId) throw new ForbiddenException('You cannot view this order');
    return order;
  }

  async findByTransactionId(transactionId: string) {
    const order = await this.orders.findOne({ where: { transactionId } });
    if (!order) throw new NotFoundException('Order for this transaction was not found');
    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.CANCELLED && status !== OrderStatus.CANCELLED) {
      throw new BadRequestException('A cancelled order cannot be reopened automatically');
    }
    if (order.status === OrderStatus.DELIVERED && status === OrderStatus.CANCELLED) {
      throw new BadRequestException('A delivered order cannot be cancelled from this screen');
    }

    if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      await this.dataSource.transaction(async (manager) => {
        for (const item of order.items) {
          const product = await manager.findOne(ProductEntity, { where: { id: item.productId } });
          if (product) {
            product.stock += item.quantity;
            await manager.save(ProductEntity, product);
          }
        }
        order.status = OrderStatus.CANCELLED;
        await manager.save(OrderEntity, order);
      });
    } else {
      order.status = status;
      if (status === OrderStatus.DELIVERED && order.paymentMethod === PaymentMethod.COD) order.paymentStatus = PaymentStatus.PAID;
      await this.orders.save(order);
    }

    const saved = await this.orders.findOne({ where: { id } });
    await this.notifications.orderUpdated(saved);
    await this.mail.sendOrderStatus(saved!.email, saved!.customerName, saved!.orderNumber, saved!.status);
    return saved;
  }

  async setTransaction(id: number, transactionId: string) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    order.transactionId = transactionId;
    order.paymentStatus = PaymentStatus.PENDING;
    return this.orders.save(order);
  }

 async markPaid(
  transactionId: string,
  gatewayData: Record<string, any>
) {
  const order =
    await this.findByTransactionId(
      transactionId
    );

  if (
    order.paymentStatus ===
    PaymentStatus.PAID
  ) {
    return order;
  }

  order.paymentStatus =
    PaymentStatus.PAID;

  order.status =
    OrderStatus.CONFIRMED;

  order.gatewayData =
    gatewayData;

  const saved =
    await this.orders.save(order);

  await this.notifications.orderUpdated(
    saved
  );

  return saved;
}

  async markPaymentFailed(
  transactionId: string,
  status: PaymentStatus,
  gatewayData?: Record<string, any>
) {
  const order =
    await this.findByTransactionId(
      transactionId
    );

  if (
    order.paymentStatus ===
    PaymentStatus.PAID
  ) {
    return order;
  }

  order.paymentStatus = status;

  order.gatewayData =
    gatewayData ||
    order.gatewayData;

  const saved =
    await this.orders.save(order);

  await this.notifications.orderUpdated(
    saved
  );

  return saved;
}

  async stats() {
    const totalOrders = await this.orders.count();
    const pendingOrders = await this.orders.count({ where: { status: OrderStatus.PENDING } });
    const paidRaw = await this.orders.createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'total')
      .where('o.paymentStatus = :paid', { paid: PaymentStatus.PAID })
      .getRawOne();
    const customers = await this.users.count({ where: { role: UserRole.CUSTOMER } });
    return { totalOrders, pendingOrders, revenue: Number(paidRaw?.total || 0), customers };
  }
}
