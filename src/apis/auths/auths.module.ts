import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAccessStrategy } from 'src/commons/auth/jwt-access.strategy';
import { JwtRefreshStrategy } from 'src/commons/auth/jwt-refresh.strategy';
import { JwtGoogleStrategy } from 'src/commons/auth/jwt-social-google.strategy';
import { JwtKakaoStrategy } from 'src/commons/auth/jwt-social-kakao.strategy';
import { JwtNaverStrategy } from 'src/commons/auth/jwt-social-naver.strategy';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { Board } from '../boards/entities/board.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Runner } from '../runners/entities/runner.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthsController } from './auths.controller';
import { AuthsResolver } from './auths.resolver';
import { AuthsService } from './auths.service';

@Module({
  imports: [
    JwtModule.register({}), //
    TypeOrmModule.forFeature([
      User, //
      BankAccount,
      Runner,
      Board,
      Inquiry,
      Payment,
      PaymentHistory,
    ]),
  ],
  providers: [
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtGoogleStrategy,
    JwtKakaoStrategy,
    JwtNaverStrategy,
    AuthsResolver, //
    AuthsService,
    BankAccountsService,
    UsersService,
  ],
  controllers: [AuthsController],
})
export class AuthsModule {}
