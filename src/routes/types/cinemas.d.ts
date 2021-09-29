export {};

declare module "express-session" {
  interface SessionData {
    _csrf: string;
  }
}
