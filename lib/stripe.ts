import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
    if (!stripeClient) {
        const key = process.env.STRIPE_SECRET_KEY || 'placeholder_stripe_key';
        stripeClient = new Stripe(key, {
            // @ts-ignore
            apiVersion: '2025-02-24.acacia',
            typescript: true,
        });
    }
    return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
    get(target, prop, receiver) {
        const client = getStripe();
        const value = Reflect.get(client, prop, receiver);
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    }
});

