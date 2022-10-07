# 🏃‍♂️ OpenRun

## 1.서비스 소개

> ### [🖥 OPENRUN 바로가기](https://openrun.site)
> 오픈런(Open Run): 특정 물건을 구매하기 위해 매장이 문을 열기도 전에 달려와 줄을 서는 현상을 의미.
>
> 경제적 이익과 희소 가치(한정판) 소유를 위하여 MZ세대를 중심으로 오픈런 수요가 늘고 있습니다. 백화점 명품을 시작으로 원소주, 당당치킨, 포켓몬빵 등 품목과 유통채널 구분없이 출시되는 한정판으로 인해 오픈런은 이제 하나의 문화로 자리잡고 있습니다.
> 
> 하지만 오픈런에 실패하거나, 물리적인 시간/거리 등의 문제로 오픈런을 시도하지 못하는 사람들도 존재합니다.
>
> ⭐️ 저희는 이러한 사람들을 위해 오픈런 대행 서비스를 제공하고자 합니다. 오픈런 행사 정보 제공과, 상품 구매를 희망하는 소비자와 오픈런을 대행해주는 오픈러너 연결을 핵심 컨텐츠로 하여 위와 같은 니즈를 해결하고자 합니다.

## 2.팀원 소개
![팀원소개-1](https://user-images.githubusercontent.com/99185757/192174460-f6fc2b03-e1bb-4904-a871-57b68585ddbe.png)
![팀원소개-2](https://user-images.githubusercontent.com/99185757/192174469-792495d1-0a95-43df-8b8b-260b12d833fa.png)

### Backend 김진성

- 담당 : TypeScript, NestJS, TypeORM, WebSocket, GraphQL, MySQL, Docker, GCP
- git : [https://github.com/uiop5487](https://github.com/uiop5487)

### Backend 조혜인

- 담당 : TypeScript, NestJS, TypeORM, Graphql, MySQL, Docker, GCP
- git : [https://github.com/Annie-Cho](https://github.com/Annie-Cho)

### Backend 한정우

- 담당 : TypeScript, NestJS, TypeORM, ELK, GraphQL, MySQL, Docker, GCP
- git : [https://github.com/EriicHaan12](https://github.com/EriicHaan12)

## 3.기술 스택
![기술스택](https://user-images.githubusercontent.com/99185757/192178471-ee8d61e0-2d86-4104-a075-7b37dbcb31fb.png)

## 4.Flow Chart
<img src="https://user-images.githubusercontent.com/99185757/192178557-9c3a7518-2752-4791-96a4-303ff809b93f.png" width="500">

## 5.ERD
![erd](https://user-images.githubusercontent.com/99185757/192178709-39681dee-a64a-447f-a9ba-815b4d8960c3.png)

## 6.API 명세서
![스크린샷 2022-09-26 오후 1 37 27](https://user-images.githubusercontent.com/99185757/192194930-b2a2d227-8218-4f4f-96c7-66f678a46a16.png)

## 7.서버 폴더구조
```
🗂openrun-server
├── Dockerfile
├── Dockerfile.dev
├── Dockerfile.prod
├── README.md
├── README_old.md
├── docker-compose.dev.yaml
├── docker-compose.prod.yaml
├── docker-compose.yaml
├── elk
│   └── logstash
│       ├── logstash.conf
│       ├── logstash.dev.conf
│       ├── mysql-connector-java-8.0.28.jar
│       ├── template-board.json
│       └── template.json
├── gcp-bucket-keyfile.json
├── nest-cli.json
├── package-lock.json
├── package.json
├── src
│   ├── api
│   │   ├── auths
│   │   │   ├── auths.controller.ts
│   │   │   ├── auths.module.ts
│   │   │   ├── auths.resolver.ts
│   │   │   └── auths.service.ts
│   │   ├── bankAccounts
│   │   │   ├── bankAccounts.service.ts
│   │   │   ├── dto
│   │   │   │   └── createBankAccount.input.ts
│   │   │   └── entities
│   │   │       └──  bankAccount.entity.ts
│   │   ├── boards
│   │   │   ├── boards.module.ts
│   │   │   ├── boards.resolver.ts
│   │   │   ├── boards.service.ts
│   │   │   ├── dto
│   │   │   │   ├── createBoard.input.ts
│   │   │   │   └── updateBoard.input.ts
│   │   │   └── entities
│   │   │       └── board.entity.ts
│   │   ├── categories
│   │   │   ├── categories.module.ts
│   │   │   ├── categories.resolver.ts
│   │   │   ├── categories.service.ts
│   │   │   └── entities
│   │   │       └── category.entity.ts
│   │   ├── chat
│   │   │   ├── chat.gateway.ts
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.resolver.ts
│   │   │   ├── chat.service.ts
│   │   │   └── entities
│   │   │       ├── chatMessage.entity.ts
│   │   │       └── chatRoom.entity.ts
│   │   ├── eventImages
│   │   │   └── entities
│   │   │       └── eventImage.entity.ts
│   │   ├── events
│   │   │   ├── dto
│   │   │   │   └── createEvent.input.ts
│   │   │   ├── entities
│   │   │   │   └── event.entity.ts
│   │   │   ├── events.module.ts
│   │   │   ├── events.resolver.ts
│   │   │   └── events.service.ts
│   │   ├── file
│   │   │   ├── file.module.ts
│   │   │   ├── file.resolver.ts
│   │   │   └── file.service.ts
│   │   ├── iamport
│   │   │   └── iamport.service.ts
│   │   ├── images
│   │   │   ├── entities
│   │   │   │   └── image.entity.ts
│   │   │   └── images.service.ts
│   │   ├── inquiries
│   │   │   ├── dto
│   │   │   │   └── inquiry.input.ts
│   │   │   ├── entities
│   │   │   │   └── inquiry.entity.ts
│   │   │   ├── inquiries.module.ts
│   │   │   ├── inquiries.resolver.ts
│   │   │   └── inquiries.service.ts
│   │   ├── inquiriesAnswer
│   │   │   ├── entities
│   │   │   │   └── inquiryAnswer.entity.ts
│   │   │   ├── inquiriesAnswer.module.ts
│   │   │   ├── inquiriesAnswer.resolver.ts
│   │   │   └── inquiriesAnswer.service.ts
│   │   ├── interests
│   │   │   ├── entities
│   │   │   │   └── interests.entity.ts
│   │   │   ├── interests.module.ts
│   │   │   ├── interests.resolver.ts
│   │   │   └── interests.service.ts
│   │   ├── locations
│   │   │   ├── dto
│   │   │   │   └── createLocation.input.ts
│   │   │   ├── entities
│   │   │   │   └── location.entity.ts
│   │   │   └── locationes.service.ts
│   │   ├── notifications
│   │   │   ├── entities
│   │   │   │   └── notification.entity.ts
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.resolver.ts
│   │   │   └── notifications.service.ts
│   │   ├── paymentHistories
│   │   │   ├── entities
│   │   │   │   └── paymentHistory.entity.ts
│   │   │   ├── paymentHistories.module.ts
│   │   │   ├── paymentHistories.resolver.ts
│   │   │   └── paymentHistories.service.ts
│   │   ├── payments
│   │   │   ├── entities
│   │   │   │   ├── payment.entity.ts
│   │   │   │   └── paymentByDate.ts
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.resolver.ts
│   │   │   └── payments.service.ts
│   │   ├── refreshes
│   │   │   ├── refreshes.module.ts
│   │   │   └── refreshes.service.ts
│   │   ├── reports
│   │   │   ├── dto
│   │   │   │   └── report.input.ts
│   │   │   ├── entities
│   │   │   │   └── report.entity.ts
│   │   │   ├── reports.module.ts
│   │   │   ├── reports.resolver.ts
│   │   │   └── reports.service.ts
│   │   ├── runners
│   │   │   ├── entities
│   │   │   │   └── runner.entity.ts
│   │   │   ├── runners.module.ts
│   │   │   ├── runners.resolver.ts
│   │   │   └── runners.service.ts
│   │   ├── tokens
│   │   │   ├── entities
│   │   │   │   └── token.entity.ts
│   │   │   ├── tokens.module.ts
│   │   │   ├── tokens.resolver.ts
│   │   │   └── tokens.service.ts
│   │   └── users
│   │       ├── dto
│   │       │   ├── createAdmin.input.ts
│   │       │   ├── createUser.input.ts
│   │       │   └── updateUser.input.ts
│   │       ├── entities
│   │       │   └── user.entity.ts
│   │       ├── users.module.ts
│   │       ├── users.resolver.ts
│   │       └── users.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── commons
│   │   ├── auth
│   │   │   ├── gql-auth.guard.ts
│   │   │   ├── jwt-access.strategy.ts
│   │   │   ├── jwt-refresh.strategy.ts
│   │   │   ├── jwt-social-google.strategy.ts
│   │   │   ├── jwt-social-kakao.strategy.ts
│   │   │   └── jwt-social-naver.strategy.ts
│   │   ├── filter
│   │   │   └── http-exception.filter.ts
│   │   ├── graphql
│   │   │   └── schema.gql
│   │   ├── libraries
│   │   │   └── utils.ts
│   │   └── types
│   │       └── type.ts
│   └── main.ts
├── tsconfig.build.json
├── tsconfig.json
└── yarn.lock
```

## 8.프로젝트 설치 및 실행 방법
>1. 레포지토리 포크
>2. Git clone
>3. yarn install
>4. docker-compose build
>5. docker-compose up

## 9.env
```
DATABASE_TYPE=mysql
DATABASE_HOST=데이터베이스 ip 또는 이름
DATABASE_PORT=지정한 포트번호
DATABASE_USERNAME=아이디
DATABASE_PASSWORD=비밀번호
DATABASE_DATABASE=데이터베이스 이름

GOOGLE_CLIENT_ID=구글 클라이언트 ID
GOOGLE_CLIENT_SECRET=구글 클라이언트 Secret
GOOGLE_CALLBACK_URL=구글 클라이언트 Callback URL

KAKAO_CLIENT_ID=카카오 클라이언트 ID
KAKAO_CLIENT_SECRET=카카오 클라이언트 Secret
KAKAO_CALLBACK_URL=카카오 클라이언트 Callback URL

NAVER_CLIENT_ID=네이버 클라이언트 ID
NAVER_CLIENT_SECRET=네이버 클라이언트 Secret
NAVER_CALLBACK_URL=네이버 클라이언트 Callback URL

REDIS_URL=Redis IP

GOOGLE_BUCKET=구글 버킷 ID
GOOGLE_BUCKET_PROJECT_ID=구글 버킷 Project ID
GOOGLE_BUCKET_KEY_FILENAME=구글 버킷 키 파일

SMS_KEY=쿨에스엠에스 키
SMS_SECRET=쿨에스엠에스 Secret
SMS_SENDER=쿨에스엠에스 발신번호

IMP_KEY=아임포트 키
IMP_SECRET=아임포트 Secret
```
