import express, { application, Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from './config';
import { prisma } from './lib/prisma';
import { userRoutes } from './modules/user/user.route';
import { loginRoutes } from './modules/auth/auth.route';
import { postRoutes } from './modules/post/post.route';
import { commentRoutes } from './modules/comment/comment.route';
import notFount from './middlewares/notFound';
import globalErrorHandler from './middlewares/globalErrorHandler';
import { subscriptionRoutes } from './modules/subscription/subscription.route';
import { premiumRoutes } from './modules/premium/premium.route';

// Create an instance of the Express application
const app: Application = express();

// cors
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// first set in webhook
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', async (req: Request, res: Response) => {
  await prisma.user.findMany();
  // console.log('All Users:', users);

  res.send('Hello, Rifat!');
});

// routes
app.use('/api/users', userRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/premium', premiumRoutes);

app.use(notFount);
app.use(globalErrorHandler);

export default app;
