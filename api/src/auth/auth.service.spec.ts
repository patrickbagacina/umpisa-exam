import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcryptjs';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const user: User = {
    id: 'user-1',
    email: 'staff@lostfound.test',
    name: 'Demo Staff',
    passwordHash: hashSync('Password123!', 4),
    createdAt: new Date(),
  };
  const jwt = new JwtService({ secret: 'test-secret', signOptions: { expiresIn: '8h' } });
  let users: { findByEmail: jest.Mock; findById: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    users = { findByEmail: jest.fn(), findById: jest.fn() };
    service = new AuthService(users as unknown as UsersService, jwt);
  });

  describe('login', () => {
    it('returns a signed token with { sub, email } and the user', async () => {
      users.findByEmail.mockResolvedValue(user);

      const result = await service.login(user.email, 'Password123!');

      expect(result.user).toBe(user);
      const payload = await jwt.verifyAsync<{ sub: string; email: string; exp: number }>(
        result.accessToken,
      );
      expect(payload).toMatchObject({ sub: 'user-1', email: 'staff@lostfound.test' });
    });

    it('rejects a wrong password', async () => {
      users.findByEmail.mockResolvedValue(user);

      await expect(service.login(user.email, 'wrong')).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
    });

    it('rejects an unknown email with the same message', async () => {
      users.findByEmail.mockResolvedValue(null);

      await expect(service.login('nobody@x.test', 'Password123!')).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
    });
  });

  describe('me', () => {
    it('returns the user for the token subject', async () => {
      users.findById.mockResolvedValue(user);
      await expect(service.me('user-1')).resolves.toBe(user);
      expect(users.findById).toHaveBeenCalledWith('user-1');
    });

    it('is unauthenticated when the user no longer exists', async () => {
      users.findById.mockResolvedValue(null);
      await expect(service.me('gone')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
