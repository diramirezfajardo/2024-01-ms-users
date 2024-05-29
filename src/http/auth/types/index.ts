export type RefreshTokenPayloadT = {
  id: number;
  email: string;
  iat: number;
  exp: number;
};

export type AccessTokenPayloadT = {
  id: number;
  email: string;
  name: string;
  lastName: string;
  birthname: string;
  iat: number;
  exp: number;
};
