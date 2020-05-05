
export interface CustomError extends Error {
  type?: string;
  errno?: string;
  syscall?: string;

  cause?(): Error;
  fullType?(this: CustomError): string;
  info?(): { [k: string]: unknown };
  toJSON?(): { [k: string]: unknown };
}
