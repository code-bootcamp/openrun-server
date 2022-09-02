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
