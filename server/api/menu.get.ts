import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const categories = await prisma.category.findMany({
    include: {
      services: {
        where: { isActive: true },
        orderBy: { id: 'asc' }
      }
    },
    orderBy: { id: 'asc' }
  })

  return categories
})
