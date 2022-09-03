import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BankAccountInput {
  @Field(() => String)
  company: string;

  @Field(() => String)
  bankAccountNum: string;
}
