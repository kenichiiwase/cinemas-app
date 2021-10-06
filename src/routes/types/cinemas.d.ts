export {};

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    _csrf: string;
  }
}
