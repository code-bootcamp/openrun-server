import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { UsersService } from '../users/users.service';
import { CreateInquiryInput } from './dto/inquiry.input';
import { Inquiry } from './entities/inquiry.entity';
import { InquiriesService } from './inquiries.service';

@Resolver()
export class InquiriesResolver {
  constructor(
    private readonly inquiriesService: InquiriesService, //

    private readonly usersService: UsersService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Inquiry)
  createInquiry(
    @Args('createInquiryInput') createInquiryInput: CreateInquiryInput, //
    @Args('boardId') boardId: string,
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    // 문의내역 생성
    return this.inquiriesService.create({
      createInquiryInput,
      email: user.email,
      boardId,
    });
  }

  @Query(() => [Inquiry])
  fetchInquiry() {
    // 모든 문의내역 조회
    return this.inquiriesService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Inquiry])
  async fetchLoginUserInquiry(
    @Context() context: IContext, //
  ) {
    const contextUser = context.req.user;

    // 현재 유저 조회
    const user = await this.usersService.findOne({ email: contextUser.email });

    // 현재 유저가 등록한 문의 내역 조회
    return this.inquiriesService.findUserInquiry({ user });
  }
}
