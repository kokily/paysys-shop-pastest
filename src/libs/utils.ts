import { Context, Next } from 'koa';

export const isLoggedIn = (ctx: Context, next: Next) => {
  const { user } = ctx.state;

  if (!user) {
    ctx.status = 403;
    return;
  }

  return next();
};

export const isAdminIn = (ctx: Context, next: Next) => {
  const { user } = ctx.state;

  if (!user) {
    ctx.status = 403;
    return;
  }

  if (
    user.username !== process.env.ADMIN1 &&
    user.username !== process.env.ADMIN2 &&
    user.username !== process.env.ADMIN3
  ) {
    ctx.status = 403;
    return;
  }

  return next();
};

export const sms_config = {
  key: process.env.ALIGO_KEY,
  user_id: process.env.ALIGO_USER,
};

export const sender = process.env.SENDER;

export const receiver = `${process.env.RECEIVER1},${process.env.RECEIVER2}`;
