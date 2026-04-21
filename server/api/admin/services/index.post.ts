import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { name, description, price, duration, isActive, categoryId } = body

  if (!name) {
    throw createError({ statusCode: 400, message: 'サービス名は必須です。' })
  }

  const service = await prisma.service.create({
    data: {
      name,
      description: description ?? null,
      price: price !== undefined ? Number(price) : null,
      duration: duration !== undefined ? Number(duration) : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      categoryId: categoryId !== undefined ? Number(categoryId) : null,
    },
  })

  return service
})
