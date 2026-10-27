import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/jwt-payload';
import { ClaimItemInput } from './dto/claim-item.input';
import { CreateItemInput } from './dto/create-item.input';
import { ItemsArgs } from './dto/items.args';
import { ItemStats } from './dto/item-stats.model';
import { Item } from './item.entity';
import { ItemsService } from './items.service';

@Resolver(() => Item)
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Query(() => [Item])
  items(@Args() args: ItemsArgs): Promise<Item[]> {
    return this.itemsService.findAll(args);
  }

  @Query(() => Item)
  item(@Args('id', { type: () => ID }) id: string): Promise<Item> {
    return this.itemsService.findOne(id);
  }

  @Query(() => ItemStats)
  itemStats(): Promise<ItemStats> {
    return this.itemsService.stats();
  }

  @Mutation(() => Item)
  createItem(@Args('input') input: CreateItemInput, @CurrentUser() user: AuthUser): Promise<Item> {
    return this.itemsService.create(input, user.id);
  }

  @Mutation(() => Item)
  claimItem(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ClaimItemInput,
  ): Promise<Item> {
    return this.itemsService.claim(id, input);
  }

  @Mutation(() => Item)
  releaseClaim(@Args('id', { type: () => ID }) id: string): Promise<Item> {
    return this.itemsService.release(id);
  }

  @Mutation(() => Item)
  returnItem(@Args('id', { type: () => ID }) id: string): Promise<Item> {
    return this.itemsService.return(id);
  }
}
