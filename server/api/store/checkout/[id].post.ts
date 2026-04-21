import Stripe from 'stripe'
import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: '商品IDが不正です。' })

  const product = await prisma.product.findFirst({ where: { id, isActive: true } })
  if (!product) throw createError({ statusCode: 404, message: '商品が見つかりません。' })
  if (product.stock <= 0) throw createError({ statusCode: 422, message: 'この商品は在庫がありません。' })

  const stripe = new Stripe(config.stripeSecretKey)
  const origin = getHeader(event, 'origin') || 'http://localhost:3000'

  const lineItems: Stripe.Checkout.SessionCreateParams['line_items'] = [{
    price_data: {
      currency: 'jpy',
      product_data: {
        name: product.name,
        ...(product.description ? { description: product.description } : {}),
        ...(product.imageUrl ? { images: [product.imageUrl] } : {})
      },
      unit_amount: product.price
    },
    quantity: 1
  }]

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${origin}/online-store/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/online-store/products/${id}`,
    metadata: { productId: String(id) }
  })

  return { url: session.url }
})
