import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const sessionUser = session.user as { id: number } | undefined
  if (!sessionUser) {
    throw createError({ statusCode: 401, message: 'ログインが必要です。' })
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: sessionUser.id },
    orderBy: { date: 'desc' }
  })

  return reservations
})
