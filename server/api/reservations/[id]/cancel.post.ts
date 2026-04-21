import prisma from '../../../utils/prisma'
import { sendReservationCancelled } from '../../../utils/mail'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const sessionUser = session.user as { id: number; role: string } | undefined
  if (!sessionUser) {
    throw createError({ statusCode: 401, message: 'ログインが必要です。' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: '予約IDが不正です。' })
  }

  const reservation = await prisma.reservation.findUnique({ where: { id } })
  if (!reservation) {
    throw createError({ statusCode: 404, message: '予約が見つかりません。' })
  }

  // Admin can cancel any; user can only cancel their own
  const isAdmin = sessionUser.role === 'admin'
  const isOwner = reservation.userId === sessionUser.id
  if (!isAdmin && !isOwner) {
    throw createError({ statusCode: 403, message: 'この操作は許可されていません。' })
  }

  if (reservation.status === 'cancelled') {
    throw createError({ statusCode: 422, message: 'すでにキャンセル済みです。' })
  }

  const body = await readBody(event).catch(() => ({}))
  const cancelReason = body?.reason ?? null

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: 'cancelled', cancelReason }
  })

  await sendReservationCancelled({
    name: updated.name,
    email: updated.email,
    date: updated.date.toISOString(),
    startTime: updated.startTime,
    reservationCode: updated.reservationCode ?? '',
    cancelReason
  })

  return { ok: true }
})
