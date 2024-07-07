export interface IUser {
  id: string;
  username: string;
  email: string;
  available: boolean;
  profile: string;
  ratings?: number;
}

export interface ICreateUser {
  username: string;
  email: string;
  password: string;
  profile: string;
}
