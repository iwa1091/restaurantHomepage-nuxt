import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, message: '商品IDが不正です。' })

  const product = await prisma.product.findFirst({
    where: { id, isActive: true }
  })

  if (!product) throw createError({ statusCode: 404, message: '商品が見つかりません。' })

  return product
})
