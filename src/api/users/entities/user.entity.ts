import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Min } from 'class-validator';
import { BankAccount } from 'src/api/bankAccounts/entities/ bankAccount.entity';

export enum USER_LOGINTYPE_ENUM {
  BASIC = '기본',
  GOOGLE = '구글',
  NAVER = '네이버',
  KAKAO = '카카오',
}

registerEnumType(USER_LOGINTYPE_ENUM, {
  name: 'USER_LOGINTYPE_ENUM',
});

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String, { nullable: true })
  id: string;

  @Column({ unique: true })
  @Field(() => String, { nullable: true })
  email: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  password: string;

  @Column({ unique: true })
  @Field(() => String, { nullable: true })
  nickName: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  phone: string;

  @Min(0)
  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  point: number;

  @Min(0)
  @Column({ nullable: true, type: 'float' })
  @Field(() => Float, { nullable: true })
  rating: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  profileImg: string;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  sucessRate: number;

  @Min(0)
  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  report: number;

  @Column({
    default: false, //
    nullable: true,
  })
  @Field(() => Boolean, { nullable: true })
  isAdmin: boolean;

  @Column({
    type: 'enum',
    enum: USER_LOGINTYPE_ENUM,
    default: USER_LOGINTYPE_ENUM.BASIC,
    nullable: true,
  })
  @Field(() => USER_LOGINTYPE_ENUM, { nullable: true })
  loginType: string;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deleteAt: Date;

  @JoinColumn()
  @OneToOne(() => BankAccount)
  @Field(() => BankAccount, { nullable: true })
  bankAccount: BankAccount;

  //관리자 페이지를 위한 total
  @Field(() => Int, { defaultValue: 0, nullable: true })
  boardTotal: number;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  inquiryTotal: number;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  paymentTotal: number;
}
