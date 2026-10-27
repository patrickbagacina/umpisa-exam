import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import type { AuthUser } from './jwt-payload';

export type AuthRequest = Request & { user?: AuthUser };

export function getRequest(context: ExecutionContext): AuthRequest {
  if (context.getType<string>() === 'graphql') {
    return GqlExecutionContext.create(context).getContext<{ req: AuthRequest }>().req;
  }
  return context.switchToHttp().getRequest<AuthRequest>();
}
