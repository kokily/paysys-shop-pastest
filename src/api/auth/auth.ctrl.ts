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
