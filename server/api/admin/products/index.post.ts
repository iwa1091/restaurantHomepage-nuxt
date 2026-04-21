import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { name, description, price, stock, imageUrl, isActive } = body

  if (!name) {
    throw createError({ statusCode: 400, message: '商品名は必須です。' })
  }
  if (price === undefined || price === null) {
    throw createError({ statusCode: 400, message: '価格は必須です。' })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description ?? null,
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 0,
      imageUrl: imageUrl ?? null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    },
  })

  return product
})
