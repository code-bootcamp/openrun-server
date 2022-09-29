import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Category } from 'src/apis/categories/entities/category.entity';
import { ChatRoom } from 'src/apis/chat/entities/chatRoom.entity';
import { Location } from 'src/apis/locations/entities/location.entity';
import { User } from 'src/apis/users/entities/user.entity';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BOARD_STATUS_ENUM {
  RECRUITING = '모집중',
  INPROGRESS = '진행중',
  FINISHED = '완료',
  REPORTING = '신고진행중',
  COMPLETED = '처리완료',
  ENDED = '일자마감',
}

registerEnumType(BOARD_STATUS_ENUM, {
  name: 'BOARD_STATUS_ENUM',
});

@Entity()
@ObjectType()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String, { nullable: true })
  title: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, name: 'contents' })
  contents: string;

  @Column({
    type: 'enum',
    enum: BOARD_STATUS_ENUM,
    default: BOARD_STATUS_ENUM.RECRUITING,
    nullable: true,
  })
  @Field(() => String, { nullable: true, name: 'status' })
  status: string;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true, name: 'price' })
  price: number;

  @Column({ nullable: true, default: 0 })
  @Field(() => Int, { nullable: true, name: 'interestCount' })
  interestCount: number;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true, name: 'dueDate' })
  dueDate: Date;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Category)
  @Field(() => Category, { nullable: true })
  category: Category;

  @JoinColumn()
  @OneToOne(() => Location)
  @Field(() => Location, { nullable: true })
  location: Location;

  @JoinColumn()
  @OneToOne(() => ChatRoom)
  @Field(() => ChatRoom, { nullable: true })
  chatRoom: ChatRoom;

  @Column()
  @Field(() => String, { nullable: true })
  image: string;

  @Field(() => Int, { nullable: true })
  runnerTotal: number;
}
