import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.session?.userId) throw new UnauthorizedException('Please login first');
    if (request.session?.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return true;
  }
}
