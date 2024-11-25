export interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface DecodedToken {
  user_id: string
  roles: string
}
