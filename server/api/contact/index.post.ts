import { sendContactMail } from '../../utils/mail'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, phone, subject, message } = body

  if (!name || !email || !message) {
    throw createError({ statusCode: 422, message: 'お名前、メールアドレス、お問い合わせ内容は必須です。' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 422, message: 'メールアドレスの形式が正しくありません。' })
  }

  await sendContactMail({ name, email, phone: phone || null, subject: subject || null, message })

  return { ok: true }
})
