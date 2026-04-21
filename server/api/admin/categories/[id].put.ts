import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: '無効なIDです。' })
  }

  const body = await readBody(event)
  const { name } = body

  if (!name) {
    throw createError({ statusCode: 400, message: 'カテゴリ名は必須です。' })
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name },
  })

  return category
})
