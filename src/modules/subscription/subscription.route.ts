import { Router } from 'express';
import { subscriptionController } from './subscription.controller';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

router.post(
  '/checkout',
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  subscriptionController.createCheckoutSession,
);

// cancel subscription API

router.post('/webhook', subscriptionController.handleWebhook);
router.get(
  '/status',
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  subscriptionController.getSubscriptionStatus,
);

export const subscriptionRoutes = router;
