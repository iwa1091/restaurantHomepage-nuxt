import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: '無効なIDです。' })
  }

  const body = await readBody(event)
  const { name, description, price, duration, isActive, categoryId } = body

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: price !== null ? Number(price) : null }),
      ...(duration !== undefined && { duration: duration !== null ? Number(duration) : null }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(categoryId !== undefined && { categoryId: categoryId !== null ? Number(categoryId) : null }),
    },
  })

  return service
})
