import prisma from '../../utils/prisma'
import { sendBanquetInquiryMail } from '../../utils/mail'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, phone, date, partySize, budget, message } = body

  if (!name || !email || !message) {
    throw createError({ statusCode: 422, message: 'お名前、メールアドレス、お問い合わせ内容は必須です。' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 422, message: 'メールアドレスの形式が正しくありません。' })
  }

  const inquiry = await prisma.banquetInquiry.create({
    data: {
      name,
      email,
      phone: phone || null,
      date: date ? new Date(date + 'T00:00:00') : null,
      partySize: partySize ? Number(partySize) : null,
      budget: budget || null,
      message,
      status: 'pending'
    }
  })

  await sendBanquetInquiryMail({
    id: inquiry.id,
    name,
    email,
    phone: phone || null,
    date: date || null,
    partySize: partySize ? Number(partySize) : null,
    budget: budget || null,
    message
  })

  return { ok: true, id: inquiry.id }
})
