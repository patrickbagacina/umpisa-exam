import { Query, Resolver } from '@nestjs/graphql';
import { Public } from './auth/public.decorator';

@Resolver()
export class AppResolver {
  @Public()
  @Query(() => String, { description: 'Liveness check; does not require auth.' })
  health(): string {
    return 'ok';
  }
}
