import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { name } = body

  if (!name) {
    throw createError({ statusCode: 400, message: 'カテゴリ名は必須です。' })
  }

  const category = await prisma.category.create({
    data: { name },
  })

  return category
})
