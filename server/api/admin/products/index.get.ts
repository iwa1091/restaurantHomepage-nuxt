import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' },
  })

  return products
})
