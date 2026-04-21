<script setup lang="ts">
import '~/assets/css/pages/admin/product/index.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: '商品管理 | すし割烹 いづ浦' })

type Product = {
  id: number
  name: string
  price: number
  stock: number
  isActive: boolean
  description: string | null
  imageUrl: string | null
}

const { data: products, refresh } = await useFetch<Product[]>('/api/admin/products')

const deleteError = ref('')

async function deleteProduct(id: number) {
  if (!confirm('この商品を削除しますか？')) return
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (e: any) {
    deleteError.value = e?.data?.message ?? '削除に失敗しました。'
  }
}
</script>

<template>
  <div class="admin-product-page" style="padding:1.5rem;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
      <h1 class="admin-product-title" style="font-size:1.4rem;font-weight:bold;">商品管理</h1>
      <NuxtLink
        to="/admin/products/create"
        class="admin-product-button admin-product-button--primary"
        style="padding:0.5rem 1rem;background:#333;color:#fff;text-decoration:none;border-radius:4px;"
      >新規作成</NuxtLink>
    </div>

    <p v-if="deleteError" style="color:red;margin-bottom:0.5rem;">{{ deleteError }}</p>

    <div class="admin-product-table-wrapper" style="overflow-x:auto;">
      <table class="admin-product-table" style="width:100%;border-collapse:collapse;font-size:0.9rem;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">ID</th>
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">商品名</th>
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">価格</th>
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">在庫</th>
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">公開</th>
            <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id" class="admin-product-row">
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ p.id }}</td>
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ p.name }}</td>
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">¥{{ p.price.toLocaleString() }}</td>
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ p.stock }}</td>
            <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ p.isActive ? '公開' : '非公開' }}</td>
            <td style="padding:0.6rem;border-bottom:1px solid #eee;display:flex;gap:0.5rem;">
              <NuxtLink
                :to="`/admin/products/${p.id}/edit`"
                style="padding:0.3rem 0.75rem;background:#555;color:#fff;text-decoration:none;border-radius:4px;font-size:0.85rem;"
              >編集</NuxtLink>
              <button
                @click="deleteProduct(p.id)"
                style="padding:0.3rem 0.75rem;background:#c00;color:#fff;border:none;border-radius:4px;font-size:0.85rem;cursor:pointer;"
              >削除</button>
            </td>
          </tr>
          <tr v-if="!products || products.length === 0">
            <td colspan="6" style="text-align:center;padding:1rem;">商品がありません。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
