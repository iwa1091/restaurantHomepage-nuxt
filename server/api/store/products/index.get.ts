import prisma from '../../../utils/prisma'

export default defineEventHandler(async () => {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' }
  })
})
