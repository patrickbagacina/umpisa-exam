import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ItemCategory } from '../item.enums';
import { IsNotInFuture } from './not-in-future.validator';

@InputType()
export class CreateItemInput {
  @Field()
  @IsString()
  @Length(2, 100, { message: 'Name must be 2–100 characters' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must be at most 500 characters' })
  description?: string | null;

  @Field(() => ItemCategory)
  @IsEnum(ItemCategory, { message: 'Choose a valid category' })
  category: ItemCategory;

  @Field()
  @IsString()
  @Length(2, 100, { message: 'Location must be 2–100 characters' })
  locationFound: string;

  @Field()
  @Type(() => Date)
  @IsDate({ message: 'Found date is required' })
  @IsNotInFuture({ message: 'Found date cannot be in the future' })
  foundAt: Date;
}
