<template>
  <div class="max-w-3xl mx-auto mt-10 bg-white p-6 shadow rounded-lg">
    <h2 class="text-2xl font-semibold mb-4 text-gray-800">Profil Bisnis</h2>

    <form @submit.prevent="updateCompanyProfile">
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-gray-600">Nama Bisnis</label>
          <input v-model="company.name" class="input" placeholder="Contoh: Temu Sua Coffee" />
        </div>

        <div>
          <label class="block text-gray-600">Alamat</label>
          <input v-model="company.address" class="input" placeholder="Alamat lengkap bisnis" />
        </div>

        <div>
          <label class="block text-gray-600">Email</label>
          <input v-model="company.email" class="input" placeholder="Email bisnis" />
        </div>

        <div>
          <label class="block text-gray-600">Telepon</label>
          <input v-model="company.phone" class="input" placeholder="Nomor telepon bisnis" />
        </div>

        <div>
          <label class="block text-gray-600">Deskripsi</label>
          <textarea
            v-model="company.description"
            class="input"
            rows="3"
            placeholder="Ceritakan sedikit tentang bisnis kamu..."
          ></textarea>
        </div>
      </div>

      <button
        type="submit"
        class="bg-emerald-600 text-white mt-6 px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
      >
        Simpan Profil
      </button>
    </form>
  </div>
</template>

<script>
import { supabase } from '@/supabaseClient'

export default {
  name: 'CompanyProfile',
  data() {
    return {
      company: {
        id: null,
        name: '',
        address: '',
        email: '',
        phone: '',
        description: '',
      },
    }
  },
  async created() {
    const { data, error } = await supabase.from('companies').select('*').single()
    if (data) this.company = data
    if (error) console.error(error)
  },
  methods: {
    async updateCompanyProfile() {
      const { error } = await supabase
        .from('companies')
        .update(this.company)
        .eq('id', this.company.id)

      if (error) {
        alert('Gagal menyimpan data.')
        console.error(error)
      } else {
        alert('Profil bisnis berhasil diperbarui!')
      }
    },
  },
}
</script>
