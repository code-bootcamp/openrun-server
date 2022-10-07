import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InquiryAnswer } from './entities/inquiryAnswer.entity';

@Injectable()
export class InquiriesAnswerService {
  constructor(
    @InjectRepository(InquiryAnswer)
    private readonly inquiriesAnswerRepository: Repository<InquiryAnswer>,
  ) {}

  create({ inquiry, contents }) {
    return this.inquiriesAnswerRepository.save({
      contents,
      inquiry,
    });
  }

  findAllByInquiry({ inquiry }) {
    return this.inquiriesAnswerRepository.find({
      where: { inquiry: { id: inquiry.id } },
    });
  }
}
