declare module 'bcryptjs' {
  export function hash(data: string | Buffer, salt: string | number): Promise<string>
  export function hash(
    data: string | Buffer,
    salt: string | number,
    callback: (err: Error | null, encrypted: string) => void,
  ): void
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>
  export function compare(
    data: string | Buffer,
    encrypted: string,
    callback: (err: Error | null, same: boolean) => void,
  ): void
  export function hashSync(data: string | Buffer, salt: string | number): string
  export function compareSync(data: string | Buffer, encrypted: string): boolean
}
