<script setup lang="ts">
import '~/assets/css/pages/admin/category-modal.css'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'カテゴリ管理 | すし割烹 いづ浦' })

type Category = {
  id: number
  name: string
  _count: { services: number }
}

const { data: categories, refresh } = await useFetch<Category[]>('/api/admin/categories')

// Per-row edit name buffer
const editNames = ref<Record<number, string>>({})

watch(categories, (val) => {
  if (val) {
    val.forEach(c => {
      if (!(c.id in editNames.value)) {
        editNames.value[c.id] = c.name
      }
    })
  }
}, { immediate: true })

const saveErrors = ref<Record<number, string>>({})
const saveSuccess = ref<Record<number, boolean>>({})

async function saveCategory(c: Category) {
  saveErrors.value[c.id] = ''
  saveSuccess.value[c.id] = false
  try {
    await $fetch(`/api/admin/categories/${c.id}`, {
      method: 'PUT',
      body: { name: editNames.value[c.id] },
    })
    saveSuccess.value[c.id] = true
    await refresh()
  }
  catch (e: any) {
    saveErrors.value[c.id] = e?.data?.message ?? '保存に失敗しました。'
  }
}

const deleteError = ref('')

async function deleteCategory(c: Category) {
  if (!confirm(`「${c.name}」を削除しますか？`)) return
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (e: any) {
    deleteError.value = e?.data?.message ?? '削除に失敗しました。'
  }
}

const newName = ref('')
const createError = ref('')
const creating = ref(false)

async function createCategory() {
  if (!newName.value) { createError.value = 'カテゴリ名は必須です。'; return }
  createError.value = ''
  creating.value = true
  try {
    await $fetch('/api/admin/categories', {
      method: 'POST',
      body: { name: newName.value },
    })
    newName.value = ''
    await refresh()
  }
  catch (e: any) {
    createError.value = e?.data?.message ?? '作成に失敗しました。'
  }
  finally {
    creating.value = false
  }
}
</script>

<template>
  <div style="padding:1.5rem;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
      <h1 style="font-size:1.4rem;font-weight:bold;">カテゴリ管理</h1>
      <NuxtLink to="/admin" style="color:#555;text-decoration:none;font-size:0.9rem;">← 管理画面に戻る</NuxtLink>
    </div>

    <p v-if="deleteError" style="color:red;margin-bottom:0.75rem;">{{ deleteError }}</p>

    <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:2rem;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">ID</th>
          <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">名前</th>
          <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">サービス数</th>
          <th style="padding:0.6rem;text-align:left;border-bottom:1px solid #ddd;">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in categories" :key="c.id">
          <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ c.id }}</td>
          <td style="padding:0.6rem;border-bottom:1px solid #eee;">
            <input
              v-model="editNames[c.id]"
              type="text"
              style="padding:0.3rem 0.5rem;border:1px solid #ccc;border-radius:4px;width:200px;"
            />
            <span v-if="saveSuccess[c.id]" style="color:green;font-size:0.8rem;margin-left:0.5rem;">保存しました</span>
            <span v-if="saveErrors[c.id]" style="color:red;font-size:0.8rem;margin-left:0.5rem;">{{ saveErrors[c.id] }}</span>
          </td>
          <td style="padding:0.6rem;border-bottom:1px solid #eee;">{{ c._count.services }}</td>
          <td style="padding:0.6rem;border-bottom:1px solid #eee;display:flex;gap:0.5rem;">
            <button
              @click="saveCategory(c)"
              style="padding:0.3rem 0.75rem;background:#555;color:#fff;border:none;border-radius:4px;font-size:0.85rem;cursor:pointer;"
            >保存</button>
            <button
              @click="deleteCategory(c)"
              style="padding:0.3rem 0.75rem;background:#c00;color:#fff;border:none;border-radius:4px;font-size:0.85rem;cursor:pointer;"
            >削除</button>
          </td>
        </tr>
        <tr v-if="!categories || categories.length === 0">
          <td colspan="4" style="text-align:center;padding:1rem;">カテゴリがありません。</td>
        </tr>
      </tbody>
    </table>

    <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;max-width:400px;">
      <h2 style="font-size:1rem;font-weight:bold;margin-bottom:0.75rem;">新規追加</h2>
      <p v-if="createError" style="color:red;margin-bottom:0.5rem;font-size:0.9rem;">{{ createError }}</p>
      <div style="display:flex;gap:0.5rem;">
        <input
          v-model="newName"
          type="text"
          placeholder="カテゴリ名"
          style="flex:1;padding:0.5rem;border:1px solid #ccc;border-radius:4px;"
          @keydown.enter="createCategory"
        />
        <button
          @click="createCategory"
          :disabled="creating"
          style="padding:0.5rem 1rem;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;"
        >追加</button>
      </div>
    </div>
  </div>
</template>
