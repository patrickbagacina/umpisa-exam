import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import type { AppConfig } from '../config/configuration';
import { UsersModule } from '../users/users.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './gql-auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const { secret, expiresIn } = config.get('jwt', { infer: true });
        return {
          secret,
          signOptions: {
            algorithm: 'HS256',
            expiresIn: expiresIn as JwtSignOptions['expiresIn'],
          },
          verifyOptions: { algorithms: ['HS256'] },
        };
      },
    }),
  ],
  providers: [AuthService, AuthResolver, { provide: APP_GUARD, useClass: GqlAuthGuard }],
})
export class AuthModule {}
