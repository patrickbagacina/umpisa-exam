import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { AuthRequest } from './request';
import { GqlAuthGuard } from './gql-auth.guard';

describe('GqlAuthGuard', () => {
  const jwt = new JwtService({ secret: 'test-secret' });
  const reflector = new Reflector();
  const guard = new GqlAuthGuard(reflector, jwt);

  function contextFor(req: Partial<AuthRequest>): ExecutionContext {
    return {
      getType: () => 'http',
      getHandler: () => () => undefined,
      getClass: () => class {},
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
  }

  afterEach(() => jest.restoreAllMocks());

  it('allows @Public() handlers without a token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    await expect(guard.canActivate(contextFor({ headers: {} }))).resolves.toBe(true);
  });

  it('rejects a missing token', async () => {
    await expect(guard.canActivate(contextFor({ headers: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an invalid token', async () => {
    const req = { headers: { authorization: 'Bearer not-a-jwt' } };
    await expect(guard.canActivate(contextFor(req))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a valid token and sets req.user', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', email: 'a@b.test' });
    const req: Partial<AuthRequest> = { headers: { authorization: `Bearer ${token}` } };

    await expect(guard.canActivate(contextFor(req))).resolves.toBe(true);
    expect(req.user).toEqual({ id: 'user-1', email: 'a@b.test' });
  });
});
