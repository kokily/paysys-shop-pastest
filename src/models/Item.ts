import mongoose, { Document } from 'mongoose';

// Item Type
export interface ItemType extends Document {
  name: string;
  native: string;
  divide: string;
  unit: string;
  price: number;
}

// User Schema
const itemSchema = new mongoose.Schema({
  name: String,
  native: String,
  divide: String,
  unit: String,
  price: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

export default mongoose.model<ItemType>('Item', itemSchema);
