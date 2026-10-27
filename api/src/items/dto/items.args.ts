import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ItemStatus } from '../item.enums';

@ArgsType()
export class ItemsArgs {
  @Field(() => ItemStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number | null;
}
