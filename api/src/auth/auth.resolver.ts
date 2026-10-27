import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { AuthPayload } from './dto/auth-payload.model';
import { LoginArgs } from './dto/login.args';
import type { AuthUser } from './jwt-payload';
import { Public } from './public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload)
  login(@Args() { email, password }: LoginArgs): Promise<AuthPayload> {
    return this.auth.login(email, password);
  }

  @Query(() => User)
  me(@CurrentUser() user: AuthUser): Promise<User> {
    return this.auth.me(user.id);
  }
}
