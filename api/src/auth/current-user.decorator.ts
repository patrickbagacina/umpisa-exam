import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from './jwt-payload';
import { getRequest } from './request';

/** The authenticated user set by GqlAuthGuard. Only use on non-public handlers. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => getRequest(context).user!,
);
