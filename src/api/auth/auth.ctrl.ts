import { Context } from 'koa';
import Joi, { ObjectSchema, ValidationResult } from 'joi';
import User, { UserType } from '../../models/User';

// Local Register (POST) /api/auth/register
export const register = async (ctx: Context) => {
  const data: ObjectSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(4).required(),
  });

  const result: ValidationResult<string> = Joi.validate(ctx.request.body, data);

  if (result.error) {
    ctx.status = 400;
    console.log(result.error);
    return;
  }

  const { username, password } = ctx.request.body;

  try {
    const exists = await User.findByUsername(username);

    if (exists) {
      ctx.status = 409;
      return;
    }

    const user: UserType = new User({ username });

    await user.setPassword(password);
    await user.save();

    ctx.body = user.serialize();
  } catch (err) {
    ctx.throw(500, err);
  }
};

// Local Login (POST) /api/auth/login
export const login = async (ctx: Context) => {
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.status = 400;
    ctx.body = '이름 또는 비밀번호를 입력하세요!';
    return;
  }

  const data: ObjectSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(4).required(),
  });

  const result: ValidationResult<string> = Joi.validate(ctx.request.body, data);

  if (result.error) {
    ctx.status = 400;
    console.log(result.error);
    return;
  }

  try {
    const user = await User.findByUsername(username);

    if (!user) {
      ctx.status = 401;
      return;
    }

    const valid = await user.checkPassword(password);

    if (!valid) {
      ctx.status = 400;
      return;
    }

    ctx.body = user.serialize();

    const token = user.generateToken();

    ctx.cookies.set('__PAYSYS_AUTH__', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  } catch (err) {
    ctx.throw(500, err);
  }
};

// Logout (POST) /api/auth/logout
export const logout = async (ctx: Context) => {
  ctx.cookies.set('__PAYSYS_AUTH__');
  ctx.status = 204;
};

// User check (GET) /api/auth/check
export const check = async (ctx: Context) => {
  const { user } = ctx.state;

  if (!user) {
    ctx.status = 401;
    return;
  }

  ctx.body = user;
};
