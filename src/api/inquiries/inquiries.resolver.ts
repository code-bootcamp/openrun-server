import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IContext } from 'src/commons/types/type';
import { CreateInquiryInput } from './dto/inquiry.input';
import { Inquiry } from './entities/inquiry.entity';
import { InquiriesService } from './inquiries.service';

@Resolver()
export class InquiriesResolver {
  constructor(
    private readonly inquiriesService: InquiriesService, //
  ) {}

  @Mutation(() => Inquiry)
  createInquiry(
    @Args('createInquiryInput') createInquiryInput: CreateInquiryInput, //
    @Args('boardId') boardId: string,
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    return this.inquiriesService.create({
      createInquiryInput,
      email: user.email,
      boardId,
    });
  }

  @Query(() => [Inquiry])
  fetchInquiry() {
    return this.inquiriesService.findAll();
  }
}
