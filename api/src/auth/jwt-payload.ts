export interface JwtPayload {
  sub: string;
  email: string;
}

/** What the guard attaches to `req.user`. */
export interface AuthUser {
  id: string;
  email: string;
}
