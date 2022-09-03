import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/api/users/entities/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  company: string;

  @Column()
  @Field(() => String)
  bankAccountNum: string;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt: Date;
}
