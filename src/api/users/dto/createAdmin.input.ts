import { Field, Float, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './createUser.input';

@InputType()
export class CreateAdminInput extends PartialType(CreateUserInput) {
  @Field(() => Int, { nullable: true, name: 'point' })
  point: number;

  @Field(() => Float, { nullable: true, name: 'rating' })
  rating: number;

  @Field(() => Int, { nullable: true, name: 'report' })
  report: number;

  @Field(() => Boolean, { nullable: true, name: 'isAdmin' })
  isAdmin: boolean;

  @Field(() => Int, { nullable: true, name: 'successRate' })
  successRate: number;
}
