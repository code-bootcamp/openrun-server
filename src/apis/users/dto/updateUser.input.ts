import { Field, InputType, PartialType } from '@nestjs/graphql';
import { BankAccountInput } from 'src/apis/bankAccounts/dto/createBankAccount.input';
import { CreateUserInput } from './createUser.input';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => String, { nullable: true, name: 'profileImg' })
  profileImg: string;

  @Field({ name: 'bankAccount', nullable: true })
  bankAccount: BankAccountInput;
}
