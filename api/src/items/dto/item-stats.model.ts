import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ItemStats {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  unclaimed: number;

  @Field(() => Int)
  claimed: number;

  @Field(() => Int)
  returned: number;
}
