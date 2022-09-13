import { Field, ObjectType } from '@nestjs/graphql';
import { Inquiry } from 'src/api/inquiries/entities/inquiry.entity';
import { User } from 'src/api/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class InquiryAnswer {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  contents: string;

  @JoinColumn()
  @OneToOne(() => Inquiry)
  @Field(() => Inquiry, { nullable: true })
  inquiry: Inquiry;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;
}
