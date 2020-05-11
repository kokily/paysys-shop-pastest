import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User Type
export interface UserType extends Document {
  username: string;
  hashedPassword: string;
  setPassword: (password: string) => void;
  checkPassword: (password: string) => boolean;
  serialize: () => UserType;
  generateToken: () => string;
}

// User Model
export interface UserModel extends Model<UserType> {
  findByUsername: (username: string) => UserType;
}

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  hashedPassword: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// User Methods
userSchema.methods.setPassword = async function (password: string): Promise<void> {
  const hashed = await bcrypt.hash(password, 10);
  this.hashedPassword = hashed;
};

userSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result;
};

userSchema.methods.serialize = function (): UserType {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

userSchema.methods.generateToken = function (): string {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    throw new Error('JWT key is missing!');
  }

  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

  return token;
};

// User Stataics
userSchema.statics.findByUsername = function (username: string): UserType {
  return this.findOne({ username });
};

export default mongoose.model<UserType, UserModel>('User', userSchema);
