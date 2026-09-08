import { Body, Controller, Param, ParseIntPipe, Post, Res, Session, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { SessionGuard } from '../common/guards/session.guard';
import { PaymentStatus } from '../orders/order.entity';
import { PaymentsService } from './payments.service';

@Controller('payments/sslcommerz')
export class PaymentsController {
  constructor(private readonly service: PaymentsService, private readonly config: ConfigService) {}

  @Post('initiate/:orderId')
  @UseGuards(SessionGuard)
  initiate(@Param('orderId', ParseIntPipe) orderId: number, @Session() session: any) {
    return this.service.initiate(orderId, session.userId, session.role);
  }

  @Post('success')
  async success(@Body() body: any, @Res() res: Response) {
    const frontend = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    try {
      const order = await this.service.handleSuccess(body);
      return res.redirect(`${frontend}/payment/success?order=${encodeURIComponent(order.orderNumber)}`);
    } catch {
      return res.redirect(`${frontend}/payment/fail?reason=validation`);
    }
  }

  @Post('fail')
  async fail(@Body() body: any, @Res() res: Response) {
    await this.service.markFailed(body, PaymentStatus.FAILED);
    const frontend = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return res.redirect(`${frontend}/payment/fail`);
  }

  @Post('cancel')
  async cancel(@Body() body: any, @Res() res: Response) {
    await this.service.markFailed(body, PaymentStatus.CANCELLED);
    const frontend = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return res.redirect(`${frontend}/payment/cancel`);
  }

  @Post('ipn')
  async ipn(@Body() body: any) {
    await this.service.handleIpn(body);
    return { received: true };
  }
}
