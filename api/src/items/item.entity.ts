import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ItemCategory, ItemStatus } from './item.enums';

@ObjectType()
@Entity('items')
export class Item {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Field(() => ItemCategory)
  @Column({ type: 'enum', enum: ItemCategory })
  category: ItemCategory;

  @Field()
  @Column({ length: 100 })
  locationFound: string;

  @Field()
  @Index()
  @Column({ type: 'datetime' })
  foundAt: Date;

  @Field(() => ItemStatus)
  @Index()
  @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.UNCLAIMED })
  status: ItemStatus;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  ownerName: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  ownerContact: string | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'datetime', nullable: true })
  claimedAt: Date | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'datetime', nullable: true })
  returnedAt: Date | null;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'loggedById' })
  loggedBy: User;

  @Column({ length: 36 })
  loggedById: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
