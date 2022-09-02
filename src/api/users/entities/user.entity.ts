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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Min } from 'class-validator';

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
  @Field(() => String)
  id: string;

  @Column({ unique: true })
  @Field(() => String)
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({ unique: true })
  @Field(() => String)
  nickName: string;

  @Column()
  @Field(() => String)
  phone: string;

  @Min(0)
  @Column()
  @Field(() => Int)
  point: number;

  @Min(0)
  @Column()
  @Field(() => Float)
  rating: number;

  @Column()
  @Field(() => String)
  profileImg: string;

  @Min(0)
  @Column()
  @Field(() => Int)
  report: number;

  @Column({ default: false })
  @Field(() => Boolean)
  isAdmin: boolean;

  @Column({
    type: 'enum',
    enum: USER_LOGINTYPE_ENUM,
    default: USER_LOGINTYPE_ENUM.BASIC,
  })
  @Field(() => USER_LOGINTYPE_ENUM)
  loginType: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deleteAt: Date;
}
