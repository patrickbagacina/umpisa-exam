import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class ClaimItemInput {
  @Field()
  @IsString()
  @Length(2, 100, { message: 'Owner name must be 2–100 characters' })
  ownerName: string;

  @Field()
  @IsString()
  @Length(5, 100, { message: 'Owner contact must be 5–100 characters' })
  ownerContact: string;
}
