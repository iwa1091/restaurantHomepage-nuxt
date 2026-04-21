<script setup lang="ts">
import '~/assets/css/pages/admin/service-index.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'サービス管理 | すし割烹 いづ浦' })

type Category = {
  id: number
  name: string
  _count: { services: number }
}

type Service = {
  id: number
  name: string
  description: string | null
  price: number | null
  duration: number | null
  isActive: boolean
  categoryId: number | null
  category: { id: number; name: string } | null
}

const { data: services, refresh: refreshServices } = await useFetch<Service[]>('/api/admin/services')
const { data: categories } = await useFetch<Category[]>('/api/admin/categories')

// Modal state
const showModal = ref(false)
const editingId = ref<number | null>(null)
const modalError = ref('')
const modalSubmitting = ref(false)

const form = reactive({
  name: '',
  description: '',
  price: '',
  duration: '',
  isActive: true,
  categoryId: '',
})

function openCreate() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.price = ''
  form.duration = ''
  form.isActive = true
  form.categoryId = ''
  modalError.value = ''
  showModal.value = true
}

function openEdit(s: Service) {
  editingId.value = s.id
  form.name = s.name
  form.description = s.description ?? ''
  form.price = s.price !== null ? String(s.price) : ''
  form.duration = s.duration !== null ? String(s.duration) : ''
  form.isActive = s.isActive
  form.categoryId = s.categoryId !== null ? String(s.categoryId) : ''
  modalError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitModal() {
  if (!form.name) { modalError.value = 'サービス名は必須です。'; return }
  modalError.value = ''
  modalSubmitting.value = true

  const body = {
    name: form.name,
    description: form.description || null,
    price: form.price !== '' ? Number(form.price) : null,
    duration: form.duration !== '' ? Number(form.duration) : null,
    isActive: form.isActive,
    categoryId: form.categoryId !== '' ? Number(form.categoryId) : null,
  }

  try {
    if (editingId.value !== null) {
      await $fetch(`/api/admin/services/${editingId.value}`, { method: 'PUT', body })
    }
    else {
      await $fetch('/api/admin/services', { method: 'POST', body })
    }
    await refreshServices()
    closeModal()
  }
  catch (e: any) {
    modalError.value = e?.data?.message ?? '保存に失敗しました。'
  }
  finally {
    modalSubmitting.value = false
  }
}

const deleteError = ref('')

async function deleteService(id: number) {
  if (!confirm('このサービスを削除しますか？')) return
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    await refreshServices()
  }
  catch (e: any) {
    deleteError.value = e?.data?.message ?? '削除に失敗しました。'
  }
}
</script>

<template>
  <div class="admin-service-page">
    <div class="admin-service-container" style="padding:1.5rem;">
      <div class="service-back-area" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
        <h1 style="font-size:1.4rem;font-weight:bold;">サービス管理</h1>
        <button
          class="service-back-button"
          @click="openCreate"
          style="padding:0.5rem 1rem;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;"
        >新規追加</button>
      </div>

      <p v-if="deleteError" style="color:red;margin-bottom:0.5rem;">{{ deleteError }}</p>

      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">ID</th>
              <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">名前</th>
              <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">カテゴリ</th>
              <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">価格</th>
              <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">時間(分)</th>
              <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">公開</th>
              <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in services" :key="s.id">
              <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ s.id }}</td>
              <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ s.name }}</td>
              <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ s.category?.name ?? '—' }}</td>
              <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ s.price !== null ? `¥${s.price.toLocaleString()}` : '—' }}</td>
              <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ s.duration ?? '—' }}</td>
              <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ s.isActive ? '公開' : '非公開' }}</td>
              <td style="padding:0.6rem;border-bottom:1px solid #eee;display:flex;gap:0.5rem;">
                <button
                  @click="openEdit(s)"
                  style="padding:0.3rem 0.75rem;background:#555;color:#fff;border:none;border-radius:4px;font-size:0.85rem;cursor:pointer;"
                >編集</button>
                <button
                  @click="deleteService(s.id)"
                  style="padding:0.3rem 0.75rem;background:#c00;color:#fff;border:none;border-radius:4px;font-size:0.85rem;cursor:pointer;"
                >削除</button>
              </td>
            </tr>
            <tr v-if="!services || services.length === 0">
              <td colspan="7" style="text-align:center;padding:1rem;">サービスがありません。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;"
      @click.self="closeModal"
    >
      <div style="background:#fff;border-radius:8px;padding:2rem;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;">
        <h2 style="font-size:1.2rem;font-weight:bold;margin-bottom:1rem;">
          {{ editingId !== null ? 'サービス編集' : '新規サービス追加' }}
        </h2>

        <p v-if="modalError" style="color:red;margin-bottom:0.75rem;">{{ modalError }}</p>

        <div style="margin-bottom:0.75rem;">
          <label style="display:block;font-weight:bold;margin-bottom:0.25rem;">名前 <span style="color:red;">*</span></label>
          <input v-model="form.name" type="text" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;" />
        </div>

        <div style="margin-bottom:0.75rem;">
          <label style="display:block;font-weight:bold;margin-bottom:0.25rem;">説明</label>
          <textarea v-model="form.description" rows="2" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;resize:vertical;" />
        </div>

        <div style="margin-bottom:0.75rem;">
          <label style="display:block;font-weight:bold;margin-bottom:0.25rem;">価格（円）</label>
          <input v-model="form.price" type="number" min="0" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;" />
        </div>

        <div style="margin-bottom:0.75rem;">
          <label style="display:block;font-weight:bold;margin-bottom:0.25rem;">所要時間（分）</label>
          <input v-model="form.duration" type="number" min="0" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;" />
        </div>

        <div style="margin-bottom:0.75rem;">
          <label style="display:block;font-weight:bold;margin-bottom:0.25rem;">カテゴリ</label>
          <select v-model="form.categoryId" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;">
            <option value="">なし</option>
            <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </select>
        </div>

        <div style="margin-bottom:1rem;">
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
            <input v-model="form.isActive" type="checkbox" />
            公開する
          </label>
        </div>

        <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
          <button
            @click="closeModal"
            style="padding:0.5rem 1rem;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;"
          >キャンセル</button>
          <button
            @click="submitModal"
            :disabled="modalSubmitting"
            style="padding:0.5rem 1rem;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;"
          >{{ modalSubmitting ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
