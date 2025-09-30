import { Schema, model, Model, Document } from 'mongoose';
import { compare, hash } from 'bcrypt';

const salt = 10;

interface IUser {
    email: string;
    password: string;
}

interface UserMethods {
    validatePass(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser, UserMethods>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await hash(this.password, salt);
    }
    next();
});

userSchema.methods.validatePass = async function (candidatePassword: string) {
  return compare(candidatePassword, this.password);
};

const User = model<IUser, UserMethods>('User', userSchema);

export default User;