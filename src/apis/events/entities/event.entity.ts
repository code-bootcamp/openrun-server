import { Field, ObjectType } from '@nestjs/graphql';
import { EventImage } from 'src/apis/eventImages/entities/eventImage.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String, { nullable: true })
  title: string;

  @Column()
  @Field(() => String, { nullable: true })
  brand: string;

  @OneToMany(() => EventImage, (EventImage) => EventImage.event)
  @Field(() => [EventImage], { nullable: true })
  contentsImage: EventImage[];

  @Column()
  @Field(() => Date, { nullable: true })
  period: Date;

  @Column()
  @Field(() => String, { nullable: true })
  location: string;

  @Column()
  @Field(() => String, { nullable: true })
  image: string;

  @Column()
  @Field(() => String, { nullable: true })
  category: string;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Column()
  fakeData: string;
}
