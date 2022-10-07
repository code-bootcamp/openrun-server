import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PAYMENT_STATUS_ENUM {
  PAYMENT = 'PAYMENT',
  CANCEL = 'CANCEL',
}

@Entity()
@ObjectType()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  impUid: string;

  @Column({ type: 'enum', enum: PAYMENT_STATUS_ENUM })
  @Field(() => String, { nullable: true })
  status: string;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  amount: number;

  @Field(() => Int, { nullable: true })
  count: number;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: User;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;
}
