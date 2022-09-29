import { Field, ObjectType } from '@nestjs/graphql';
import { Inquiry } from 'src/apis/inquiries/entities/inquiry.entity';
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
