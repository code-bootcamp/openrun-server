import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Min } from 'class-validator';
import { BankAccount } from 'src/apis/bankAccounts/entities/ bankAccount.entity';

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

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  nickName: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  phone: string;

  @Min(0)
  @Column({ nullable: true, default: 0 })
  @Field(() => Int, { nullable: true })
  point: number;

  @Min(0)
  @Column({ nullable: true, type: 'float', default: 0 })
  @Field(() => Float, { nullable: true })
  rating: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  profileImg: string;

  @Min(0)
  @Column({ nullable: true, default: 0 })
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

  @Column({
    nullable: true,
  })
  @Field(() => Date, { nullable: true })
  loginDate: Date;

  @Column({ nullable: true, default: 0 })
  @Field(() => Int, { nullable: true })
  successRate: number;

  @Column({ nullable: true, default: 0 })
  @Field(() => Int, { nullable: true })
  runnerCount: number;

  // @CreateDateColumn()
  @Column({ nullable: true })
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

  @Field(() => Int, { defaultValue: 0, nullable: true })
  countByDate: number;
}
