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
