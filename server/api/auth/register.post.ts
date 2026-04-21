import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'
import { sendWelcomeMail } from '../../utils/mail'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, password_confirmation } = body

  // バリデーション
  if (!name || !email || !password) {
    throw createError({ statusCode: 422, message: '名前・メールアドレス・パスワードは必須です' })
  }

  if (password !== password_confirmation) {
    throw createError({ statusCode: 422, message: 'パスワードが一致しません' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 422, message: 'パスワードは8文字以上で入力してください' })
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    throw createError({ statusCode: 422, message: 'このメールアドレスは既に使用されています' })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'user'
    }
  })

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })

  await sendWelcomeMail(user.email, user.name)

  return { ok: true }
})
