declare module 'jsonwebtoken' {
  import type { JwtPayload } from 'jsonwebtoken'

  export interface SignOptions {
    expiresIn?: string | number
    algorithm?: string
    [key: string]: unknown
  }

  export function sign(payload: string | Buffer | object, secretOrPrivateKey: string, options?: SignOptions): string
  export function verify<T = JwtPayload>(token: string, secretOrPublicKey: string): T

  export { JwtPayload }

  const jwt: {
    sign: typeof sign
    verify: typeof verify
  }

  export default jwt
}
