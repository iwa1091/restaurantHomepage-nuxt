import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const inquiries = await prisma.banquetInquiry.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return inquiries
})
