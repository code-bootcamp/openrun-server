import { FindOperator } from 'typeorm';

export interface IUser {
  user: {
    email: string;
    sub: string;
  };
}

export interface IContext {
  req?: Request & IUser;
  res?: Response;
}

export interface IOAuthUser {
  user: {
    email: string;
    password: string;
    nickName: string;
    phone: string;
    profileImg: string;
  };
}

export interface ICategory {
  name: 'string';
}

export interface ILocation {
  address: FindOperator<string>;
}

export interface IWhereQuery {
  dueDate: FindOperator<Date>;
  category?: ICategory;
  location?: ILocation;
}
