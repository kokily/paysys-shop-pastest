import Koa, { Context } from 'koa';
import Router from 'koa-router';
import mongoose from 'mongoose';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';

const app = new Koa();
const router = new Router();
const { MONGODB_URI } = process.env;

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log(`MongoDB connected: ${MONGODB_URI}`))
    .catch((err: Error) => console.log(err));
}

router.get('/', (ctx: Context) => {
  ctx.body = 'Testing';
});

app.use(logger());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

export default app;
