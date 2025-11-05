<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">🧾 Pengaturan Profil Bisnis</h1>

    <div v-if="loading" class="text-center py-6">Loading data...</div>

    <form v-else @submit.prevent="saveCompany" class="space-y-4">
      <!-- Logo -->
      <div>
        <label class="block font-semibold mb-1">Logo Bisnis</label>
        <div class="flex items-center gap-4">
          <img v-if="form.logo_url" :src="form.logo_url" alt="logo" class="w-16 h-16 object-contain border rounded-md" />
          <input type="file" accept="image/*" @change="handleFileUpload" class="text-sm" />
        </div>
      </div>

      <!-- Nama -->
      <div>
        <label class="block font-semibold mb-1">Nama Bisnis</label>
        <input v-model="form.name" type="text" class="w-full border rounded-md px-3 py-2" required />
      </div>

      <!-- Tagline -->
      <div>
        <label class="block font-semibold mb-1">Tagline</label>
        <input v-model="form.tagline" type="text" class="w-full border rounded-md px-3 py-2" />
      </div>

      <!-- Alamat -->
      <div>
        <label class="block font-semibold mb-1">Alamat</label>
        <textarea v-model="form.address" rows="2" class="w-full border rounded-md px-3 py-2"></textarea>
      </div>

      <!-- Kontak -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold mb-1">Nomor Telepon</label>
          <input v-model="form.phone" type="text" class="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full border rounded-md px-3 py-2" />
        </div>
      </div>

      <!-- Website -->
      <div>
        <label class="block font-semibold mb-1">Website</label>
        <input v-model="form.website" type="url" class="w-full border rounded-md px-3 py-2" />
      </div>

      <div class="pt-4 flex justify-end gap-3">
        <button
          type="button"
          @click="fetchCompany"
          class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
        >
          Refresh
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'

export default {
  name: 'CompanySettings',
  setup() {
    const loading = ref(true)
    const saving = ref(false)
    const form = ref({
      id: null,
      name: '',
      tagline: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logo_url: ''
    })

    const fetchCompany = async () => {
      loading.value = true
      const { data, error } = await supabase.from('companies').select('*').limit(1).single()
      if (error) {
        console.error('Gagal mengambil profil:', error)
      } else if (data) {
        form.value = data
      }
      loading.value = false
    }

    const saveCompany = async () => {
      saving.value = true
      const { id, ...updateData } = form.value

      const { error } = id
        ? await supabase.from('companies').update(updateData).eq('id', id)
        : await supabase.from('companies').insert([updateData])

      if (error) {
        alert('❌ Gagal menyimpan: ' + error.message)
      } else {
        alert('✅ Profil berhasil disimpan!')
        fetchCompany()
      }
      saving.value = false
    }

    const handleFileUpload = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      const fileName = `${Date.now()}_${file.name}`
      const { error } = await supabase
        .storage
        .from('logos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (error) {
        alert('❌ Upload gagal: ' + error.message)
        return
      }

      const publicUrl = supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl
      form.value.logo_url = publicUrl
    }

    onMounted(fetchCompany)

    return {
      form,
      loading,
      saving,
      fetchCompany,
      saveCompany,
      handleFileUpload
    }
  }
}
</script>
