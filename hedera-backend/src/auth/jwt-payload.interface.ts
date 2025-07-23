export interface JwtPayload {
  sub: string; // userId
  username: string;
  accountId: string;
  roles: string[]; // ['admin'] ou ['user']
}
