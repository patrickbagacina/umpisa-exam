import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 255, unique: true })
  email: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  // Never exposed through GraphQL.
  @Column({ length: 100 })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
