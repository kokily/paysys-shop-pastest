import { Context, Next } from 'koa';
import mongoose from 'mongoose';
import Joi, { ObjectSchema, ValidationResult } from 'joi';
import Item, { ItemType } from '../../models/Item';

// Add Item (POST) /api/items
export const addItem = async (ctx: Context) => {
  const data: ObjectSchema = Joi.object().keys({
    name: Joi.string().required(),
    native: Joi.string().required(),
    divide: Joi.string().required(),
    unit: Joi.string().required(),
    price: Joi.number().required(),
  });

  const result: ValidationResult<string> = Joi.validate(ctx.request.body, data);

  if (result.error) {
    ctx.status = 400;
    console.log(result.error);
    return;
  }

  try {
    const item = new Item(ctx.request.body);

    await item.save();

    ctx.body = item;
  } catch (err) {
    ctx.throw(500, err);
  }
};

// List Items (GET) /api/items
export const listItems = async (ctx: Context) => {
  const page: string | number = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { name }: ItemType = ctx.query;
  const query = {
    ...(name ? { name: { $regex: name } } : {}),
  };

  try {
    const items = await Item.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean()
      .exec();
    const itemCount = await Item.countDocuments(query);

    ctx.set('Last-Page', Math.ceil(itemCount / 10).toString());
    ctx.body = items;
  } catch (err) {
    ctx.throw(500, err);
  }
};

// Read Item (GET) /api/items/:id
export const readItem = async (ctx: Context) => {
  ctx.body = ctx.state.item;
};

// Remove Item (DELETE) /api/items/:id
export const removeItem = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await Item.findByIdAndRemove(id).exec();

    ctx.status = 204;
  } catch (err) {
    ctx.throw(500, err);
  }
};

// Update Item (PATCH) /api/items/:id
export const updateItem = async (ctx: Context) => {
  const { id } = ctx.params;

  const data: ObjectSchema = Joi.object().keys({
    name: Joi.string(),
    native: Joi.string(),
    divide: Joi.string(),
    unit: Joi.string(),
    price: Joi.number(),
  });

  const result: ValidationResult<string> = Joi.validate(ctx.request.body, data);

  if (result.error) {
    ctx.status = 400;
    console.log(result.error);
    return;
  }

  const newItem = {
    ...ctx.request.body,
    updatedAt: Date.now,
  };

  try {
    const item = await Item.findByIdAndUpdate(id, newItem, { new: true }).exec();

    if (!item) {
      ctx.status = 404;
      return;
    }

    ctx.body = item;
  } catch (err) {
    ctx.throw(500, err);
  }
};

// Get by ID
export const getById = async (ctx: Context, next: Next) => {
  const { id } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }

  const item = await Item.findById(id);

  if (!item) {
    ctx.status = 404;
    return;
  }

  ctx.state.item = item;

  return next();
};
