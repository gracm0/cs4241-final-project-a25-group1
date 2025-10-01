import { Schema, model, Model, Document } from 'mongoose';
import { compare, hash } from 'bcrypt';

const SALT = 10;

export interface IUser {
  email: string;
  password: string;
}

export interface UserMethods {
  validatePass(password: string): Promise<boolean>;
}

export type UserDocument = Document<unknown, {}, IUser> & IUser & UserMethods;

const userSchema = new Schema<IUser, Model<IUser, {}, UserMethods>>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, SALT);
  next();
});

userSchema.methods.validatePass = async function (candidatePassword: string) {
  return compare(candidatePassword, this.password);
};

const User = model<IUser, Model<IUser, {}, UserMethods>>('User', userSchema);

export default User;