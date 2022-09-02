import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Category } from 'src/api/categories/entities/category.entity';
import { Image } from 'src/api/images/entities/image.entity';
import { Location } from 'src/api/locations/entities/location.entity';
import { User } from 'src/api/users/entities/user.entity';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BOARD_STATUS_ENUM {
  RECRUITING = '모집중',
  INPROGRESS = '진행중',
  FINISHED = '완료',
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
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => String)
  contents: string;

  @Column({
    type: 'enum',
    enum: BOARD_STATUS_ENUM,
    default: BOARD_STATUS_ENUM.RECRUITING,
  })
  @Field(() => BOARD_STATUS_ENUM)
  status: string;

  @Column()
  @Field(() => Int)
  price: number;

  @Column()
  @Field(() => Int)
  productPrice: number;

  @Column()
  @Field(() => String)
  storeName: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt: Date;

  @Column()
  @Field(() => Date)
  dueDate: Date;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @ManyToOne(() => Category)
  @Field(() => Category)
  category: Category;

  @JoinColumn()
  @OneToOne(() => Location)
  @Field(() => Location)
  location: Location;

  @OneToMany(() => Image, (image) => image.board)
  @Field(() => [Image])
  image: Image[];
}
