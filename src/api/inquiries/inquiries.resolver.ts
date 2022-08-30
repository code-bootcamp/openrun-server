import { Resolver } from '@nestjs/graphql';
import { InquiriesService } from './inquiries.service';

@Resolver()
export class InquiriesResolver {
  constructor(
    private readonly inquiriesService: InquiriesService, //
  ) {}
}
