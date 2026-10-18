import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../generated/prisma/enums';
import { premiumController } from './premium.controller';
import { subscriptionGuard } from '../../middlewares/premiumGuard';

const router = Router();

router.get(
  '/posts',
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  subscriptionGuard(),
  premiumController.getPremiumContent,
);

export const premiumRoutes = router;
