import { Field, ObjectType } from '@nestjs/graphql';
import { Inquiry } from 'src/api/inquiries/entities/inquiry.entity';
import { User } from 'src/api/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class InquiriesAnswer {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  contents: string;

  @JoinColumn()
  @OneToOne(() => Inquiry)
  @Field(() => Inquiry)
  inquiry: Inquiry;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;
}
