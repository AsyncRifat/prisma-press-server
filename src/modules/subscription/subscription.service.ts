import config from '../../config';
import { prisma } from '../../lib/prisma';
import { stripe } from '../../lib/stripe';
import {
  handleChangeSubscription,
  handleCheckoutCompleted,
} from './subscription.utils';

// checkout session for stripe subscription:
const createCheckoutSession = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async tx => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });

    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.email,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_product_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: stripeCustomerId,
      payment_method_types: ['card'],

      // todo: change front end url
      success_url: `${config.frontend_url}/premium?success=true`,
      cancel_url: `${config.frontend_url}/payment?success=false`,
      metadata: { userId: user.id },
    });
    return session.url;
  });

  return {
    paymentUrl: transactionResult,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('------------>>>>>>>>>>', event.data.object);
      await handleCheckoutCompleted(event.data.object);
      break;

    case 'customer.subscription.updated':
      await handleChangeSubscription(event.data.object);
      break;

    /*
      To test his run this command in terminal
      stripe subscriptions cancel sub_1UN9YrBQZxuTlrI2j9IYzeNF (past existing subscriptionId)
     */

    case 'customer.subscription.deleted':
      await handleChangeSubscription(event.data.object);
      break;

    /*
    to test his run this cmd in terminal
    stripe subscriptions cancel 
    */

    default:
      // Unexpected event type
      console.log(`No event type match ${event.type}.`);
      break;
  }
};

const getSubscriptionStatus = async (userId: string) => {
  const isSubscriptionExit = await prisma.subscription.findFirstOrThrow({
    where: {
      userId,
    },
  });

  const isActive =
    isSubscriptionExit.status === 'ACTIVE' &&
    isSubscriptionExit.currentPeriodEnd &&
    new Date(isSubscriptionExit.currentPeriodEnd) > new Date();

  return {
    status: isSubscriptionExit.status,
    isSubscribed: isActive,
    currentPeriodEnd: isSubscriptionExit.currentPeriodEnd,
  };
};

export const subscriptionService = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
};
