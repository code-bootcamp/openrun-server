import { Field, InputType, PartialType } from '@nestjs/graphql';
import { BankAccountInput } from 'src/api/bankAccounts/dto/createBankAccount.input';
import { CreateUserInput } from './createUser.input';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field({ name: 'bankAccount', nullable: true })
  bankAccount: BankAccountInput;
}
