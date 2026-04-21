import Stripe from 'stripe'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  const rawBody = await readRawBody(event)
  const signature = getHeader(event, 'stripe-signature')

  if (!rawBody || !signature) {
    throw createError({ statusCode: 400, message: 'Bad request' })
  }

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret)
  }
  catch {
    throw createError({ statusCode: 400, message: 'Webhook signature verification failed' })
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session
    const productId = session.metadata?.productId

    if (productId) {
      await prisma.product.updateMany({
        where: { id: Number(productId), stock: { gt: 0 } },
        data: { stock: { decrement: 1 } }
      })
    }
  }

  return { received: true }
})
