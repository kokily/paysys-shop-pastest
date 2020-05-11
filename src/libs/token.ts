import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { UserType } from '../models/User';

const { JWT_SECRET } = process.env;

type TokenType = {
  exp: number;
};

type AccessToken = {
  _id: mongoose.Types.ObjectId;
  username: string;
} & TokenType;

// Decode Token
const decodeToken = <T = any>(token: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (!JWT_SECRET) return;

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded as any);
    });
  });
};

const jwt_middleware = async (ctx: Context, next: Next) => {
  const token: string | undefined = ctx.cookies.get('__PAYSYS_AUTH__');

  if (!token) return next();

  try {
    const decoded = await decodeToken<AccessToken>(token);

    ctx.state.user = {
      _id: decoded._id,
      username: decoded.username,
    };

    const now: number = Math.floor(Date.now() / 1000);

    if (decoded.exp - now < 60 * 60 * 24 * 1) {
      const user: UserType | null = await User.findById(decoded._id);

      if (!user) {
        return next();
      }

      const token: string = user.generateToken();

      ctx.cookies.set('__PAYSYS_AUTH__', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      return next();
    }
    return next();
  } catch (err) {
    console.log(err);
    return next();
  }
};

export default jwt_middleware;
