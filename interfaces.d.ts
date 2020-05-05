
export interface CustomError extends Error {
  type?: string;
  errno?: string;
  syscall?: string;

  cause?(): Error;
  fullType?(this: CustomError): string;
  info?(): object;
  toJSON?(): { [k: string]: unknown };
}
