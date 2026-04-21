import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: '無効なIDです。' })
  }

  const serviceCount = await prisma.service.count({ where: { categoryId: id } })
  if (serviceCount > 0) {
    throw createError({
      statusCode: 422,
      message: 'このカテゴリにはサービスが紐づいているため削除できません。',
    })
  }

  await prisma.category.delete({ where: { id } })

  return { success: true }
})
