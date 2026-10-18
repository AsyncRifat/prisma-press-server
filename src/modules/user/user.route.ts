import { Router } from 'express';
import { userController } from './user.controller';
import { Role } from '../../../generated/prisma/enums';
import { auth } from '../../middlewares/auth';

const router = Router();

// user registration route
router.post('/register', userController.registerUser);

// user get profile route
router.get(
  '/me',
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  userController.getMyProfile,
);

// update profile
router.put(
  '/my-profile',
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  userController.updateMyProfile,
);

export const userRoutes = router;
