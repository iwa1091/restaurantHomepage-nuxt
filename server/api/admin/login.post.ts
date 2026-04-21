import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 422, message: 'メールアドレスとパスワードは必須です' })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 401, message: 'メールアドレスまたはパスワードが正しくありません' })
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw createError({ statusCode: 401, message: 'メールアドレスまたはパスワードが正しくありません' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })

  return { ok: true }
})
