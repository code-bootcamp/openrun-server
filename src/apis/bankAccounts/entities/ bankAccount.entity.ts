import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({
    nullable: true,
  })
  @Field(() => String)
  company: string;

  @Column({ nullable: true })
  @Field(() => String)
  bankAccountNum: string;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt: Date;
}
