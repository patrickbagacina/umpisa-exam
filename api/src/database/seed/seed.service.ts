import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Item } from '../../items/item.entity';
import { ItemStatus } from '../../items/item.enums';
import { User } from '../../users/user.entity';
import { daysAgo, DEMO_USER, SEED_ITEMS } from './seed-data';

const BCRYPT_ROUNDS = 10;

/** Seeds the demo login and sample items on startup, only when the users table is empty. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    if (await this.run()) this.logger.log(`Seeded demo user ${DEMO_USER.email}`);
  }

  /** Returns true when it seeded, false when data already existed. */
  async run(now = new Date()): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(User);
      if ((await users.count()) > 0) return false;

      const user = await users.save(
        users.create({
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          passwordHash: await hash(DEMO_USER.password, BCRYPT_ROUNDS),
        }),
      );

      const items = manager.getRepository(Item);
      await items.save(
        SEED_ITEMS.map(({ foundDaysAgo, owner, ...item }) => {
          const foundAt = daysAgo(foundDaysAgo, now);
          const claimedAt = owner ? daysAgo(Math.max(foundDaysAgo - 1, 0), now) : null;
          return items.create({
            ...item,
            foundAt,
            loggedById: user.id,
            ownerName: owner?.name ?? null,
            ownerContact: owner?.contact ?? null,
            claimedAt,
            returnedAt: item.status === ItemStatus.RETURNED ? claimedAt : null,
          });
        }),
      );
      return true;
    });
  }
}
