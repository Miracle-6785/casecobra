
import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
    try {
        console.log('Webhook received');
        const body = await req.text()
        console.log('Webhook body', body);
        const signature = headers().get('stripe-signature')

        if (!signature) {
            return new Response('Invalid signature', { status: 400 })
        }

        console.log('Webhook signature', signature);

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
        console.log('Webhook event', event.type);

        if (event.type === 'checkout.session.completed') {
            if (!event.data.object.customer_details?.email) {
                throw new Error('Missing user email')
            }

            const session = event.data.object as Stripe.Checkout.Session

            const { userId, orderId } = session.metadata || {
                userId: null,
                orderId: null,
            }

            console.log('User ID', userId);
            console.log('Order ID', orderId);

            if (!userId || !orderId) {
                throw new Error('Invalid request metadata')
            }

            const billingAddress = session.customer_details!.address
            const shippingAddress = session.shipping_details!.address

            console.log('Billing address', billingAddress);
            console.log('Shipping address', shippingAddress);

            const updatedOrder = await db.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    isPaid: true,
                    shippingAddress: {
                        create: {
                            name: session.customer_details!.name!,
                            city: shippingAddress!.city!,
                            country: shippingAddress!.country!,
                            postalCode: shippingAddress!.postal_code!,
                            street: shippingAddress!.line1!,
                            state: shippingAddress!.state,
                        },
                    },
                    billingAddress: {
                        create: {
                            name: session.customer_details!.name!,
                            city: billingAddress!.city!,
                            country: billingAddress!.country!,
                            postalCode: billingAddress!.postal_code!,
                            street: billingAddress!.line1!,
                            state: billingAddress!.state,
                        },
                    },
                },
            })

            console.log('Order updated', updatedOrder);
        }

        return NextResponse.json({ result: event, ok: true })
    } catch (err) {
        console.error(err)

        return NextResponse.json(
            { message: 'Something went wrong', ok: false },
            { status: 500 }
        )
    }
}