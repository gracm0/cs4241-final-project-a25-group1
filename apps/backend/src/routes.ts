import { Router } from 'express';
import { register, login } from './service/auth';

const router = Router();

router.post('/signup', async (req, res) => {
    try {
        await register(req.body.email, req.body.password);
        res.status(201).send('User signed up');
        res.redirect('/login');
    } catch (error) {
        res.redirect('/signup');
    }
});

router.post('/login', async (req, res) => {
    try {
        await login(req.body.email, req.body.password);
        res.status(200).send('Login successful');
        res.redirect('/bucketList');
    } catch (error) {
        res.redirect('/login');
    }
});

export default router;