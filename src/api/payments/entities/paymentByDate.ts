import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentByDate {
  @Field(() => String)
  id: string;

  @Field(() => Int, { nullable: true })
  amount: number;

  @Field(() => Int, { nullable: true })
  count: number;
}
