import { Resolver } from '@nestjs/graphql';
import { InquiriesAnswerService } from './inquiriesAnswer.service';

@Resolver()
export class InquiriesAnswerResolver {
  constructor(
    private readonly inquiriesAnswerService: InquiriesAnswerService,
  ) {}
}
