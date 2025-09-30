import 'dotenv/config';
import connectDB from './db';
import User from './models/User';

connectDB();

const newUser = new User({
    email: 'gymahoney@wpi.edu',
    password: 'password123',
});

