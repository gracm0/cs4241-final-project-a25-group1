import { Schema, model, Model, Document } from 'mongoose';
import { compare, hash } from 'bcrypt';

const SALT = 10;

export interface IUser {
  first: string;
  last: string;
  email: string;
  password: string;
}

export interface UserMethods {
  validatePass(password: string): Promise<boolean>;
}

export type UserDocument = Document<unknown, {}, IUser> & IUser & UserMethods;

interface UserModel extends Model<IUser, {}, UserMethods> {}

const userSchema = new Schema<IUser, UserModel>(
  {
    first: { type: String, required: true },
    last: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, SALT);
  next();
});

userSchema.methods.validatePass = async function (candidatePassword: string) {
  return compare(candidatePassword, this.password);
};

const User = model<IUser, UserModel>('User', userSchema);
export default User;
