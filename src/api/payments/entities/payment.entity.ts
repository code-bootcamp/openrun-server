import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/api/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
  @Field(() => String)
  status: string;

  @Column({ nullable: true })
  @Field(() => Int)
  amount: number;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;
}
