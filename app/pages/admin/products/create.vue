<script setup lang="ts">
import '~/assets/css/pages/admin/product/create.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: '商品作成 | すし割烹 いづ浦' })

const router = useRouter()

const form = reactive({
  name: '',
  description: '',
  price: '',
  stock: '0',
  imageUrl: '',
  isActive: true,
})

const error = ref('')
const submitting = ref(false)

async function submit() {
  if (!form.name) { error.value = '商品名は必須です。'; return }
  if (!form.price) { error.value = '価格は必須です。'; return }

  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/admin/products', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl || null,
        isActive: form.isActive,
      },
    })
    router.push('/admin/products')
  }
  catch (e: any) {
    error.value = e?.data?.message ?? '作成に失敗しました。'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="admin-product-create-page" style="padding:1.5rem;max-width:600px;">
    <div style="margin-bottom:1rem;">
      <NuxtLink to="/admin/products" style="color:#555;text-decoration:none;">← 商品一覧に戻る</NuxtLink>
    </div>

    <h1 style="font-size:1.4rem;font-weight:bold;margin-bottom:1.5rem;">商品作成</h1>

    <p v-if="error" style="color:red;margin-bottom:0.75rem;">{{ error }}</p>

    <div style="margin-bottom:1rem;">
      <label style="display:block;font-weight:bold;margin-bottom:0.3rem;">商品名 <span style="color:red;">*</span></label>
      <input v-model="form.name" type="text" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;" />
    </div>

    <div style="margin-bottom:1rem;">
      <label style="display:block;font-weight:bold;margin-bottom:0.3rem;">説明</label>
      <textarea v-model="form.description" rows="3" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;resize:vertical;" />
    </div>

    <div style="margin-bottom:1rem;">
      <label style="display:block;font-weight:bold;margin-bottom:0.3rem;">価格（円） <span style="color:red;">*</span></label>
      <input v-model="form.price" type="number" min="0" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;" />
    </div>

    <div style="margin-bottom:1rem;">
      <label style="display:block;font-weight:bold;margin-bottom:0.3rem;">在庫数</label>
      <input v-model="form.stock" type="number" min="0" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;" />
    </div>

    <div style="margin-bottom:1rem;">
      <label style="display:block;font-weight:bold;margin-bottom:0.3rem;">画像URL</label>
      <input v-model="form.imageUrl" type="text" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;" />
    </div>

    <div style="margin-bottom:1.5rem;">
      <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
        <input v-model="form.isActive" type="checkbox" />
        公開する
      </label>
    </div>

    <button
      @click="submit"
      :disabled="submitting"
      style="padding:0.6rem 1.5rem;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;"
    >
      {{ submitting ? '作成中...' : '作成する' }}
    </button>
  </div>
</template>
