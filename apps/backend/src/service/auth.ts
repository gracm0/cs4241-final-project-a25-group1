
import User, { UserDocument } from '../models/User';

export async function register(email: string, password: string) {
  const existing: UserDocument | null = await User.findOne({ email });
  if (existing) throw new Error('User already exists');

  const newUser = new User({ email, password }); // TS now infers correct type
  await newUser.save();
  return newUser;
}

export async function login(email: string, password: string) {
  const user: UserDocument | null = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const isValid = await user.validatePass(password);
  if (!isValid) throw new Error('Invalid password');

  return user;
}
