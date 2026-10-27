import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GraphQLError } from 'graphql';
import { FindOptionsWhere, Raw, Repository } from 'typeorm';
import { ClaimItemInput } from './dto/claim-item.input';
import { CreateItemInput } from './dto/create-item.input';
import { ItemsArgs } from './dto/items.args';
import { ItemStats } from './dto/item-stats.model';
import { InvalidTransitionError, ItemAction, transition } from './item-status';
import { Item } from './item.entity';
import { ItemStatus } from './item.enums';

const SEARCH_FIELDS = ['name', 'description', 'locationFound'] as const;

/** Escapes LIKE wildcards so a search for "50%" matches the literal text. */
export function likePattern(search: string): string {
  return `%${search.toLowerCase().replace(/[\\%_]/g, '\\$&')}%`;
}

@Injectable()
export class ItemsService {
  constructor(@InjectRepository(Item) private readonly items: Repository<Item>) {}

  async create(input: CreateItemInput, loggedById: string): Promise<Item> {
    const { id } = await this.items.save(
      this.items.create({
        ...input,
        description: input.description || null,
        status: ItemStatus.UNCLAIMED,
        loggedById,
      }),
    );
    return this.findOne(id);
  }

  findAll({ status, search, limit }: ItemsArgs = {}): Promise<Item[]> {
    const base: FindOptionsWhere<Item> = status ? { status } : {};
    const term = search?.trim();
    const where = term
      ? SEARCH_FIELDS.map((field) => ({
          ...base,
          [field]: Raw((alias) => `LOWER(${alias}) LIKE :search`, { search: likePattern(term) }),
        }))
      : base;

    return this.items.find({
      where,
      relations: { loggedBy: true },
      order: { foundAt: 'DESC', createdAt: 'DESC' },
      take: limit ?? undefined,
    });
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.items.findOne({ where: { id }, relations: { loggedBy: true } });
    if (!item) throw new GraphQLError('Item not found', { extensions: { code: 'NOT_FOUND' } });
    return item;
  }

  async stats(): Promise<ItemStats> {
    const [unclaimed, claimed, returned] = await Promise.all(
      [ItemStatus.UNCLAIMED, ItemStatus.CLAIMED, ItemStatus.RETURNED].map((status) =>
        this.items.countBy({ status }),
      ),
    );
    return { total: unclaimed + claimed + returned, unclaimed, claimed, returned };
  }

  claim(id: string, { ownerName, ownerContact }: ClaimItemInput): Promise<Item> {
    return this.changeStatus(id, 'claim', { ownerName, ownerContact, claimedAt: new Date() });
  }

  release(id: string): Promise<Item> {
    return this.changeStatus(id, 'release', {
      ownerName: null,
      ownerContact: null,
      claimedAt: null,
    });
  }

  return(id: string): Promise<Item> {
    return this.changeStatus(id, 'return', { returnedAt: new Date() });
  }

  private async changeStatus(
    id: string,
    action: ItemAction,
    changes: Partial<Item>,
  ): Promise<Item> {
    const item = await this.findOne(id);
    const patch = { ...changes, status: transition(item.status, action) };

    // Only update if nobody changed the status since we read it.
    const { affected } = await this.items.update({ id, status: item.status }, patch);
    if (!affected) throw new InvalidTransitionError(action, (await this.findOne(id)).status);

    return Object.assign(item, patch);
  }
}
