<!-- 
  src/views/Login.vue
  (UPDATE) Tampilan full-styling dengan Tailwind CSS
  DAN tambahan field (Nama, HP, Gender) di form Daftar
-->
<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
      
      <!-- Logo dan Judul -->
      <div class="flex flex-col items-center">
        <div class="flex items-center justify-center mb-4">
          <span class="text-5xl">☕</span>
          <h1 class="text-4xl font-bold text-gray-800 ml-3">TemuPOS</h1>
        </div>
        <p class="text-gray-500">{{ view === 'login' ? 'Silakan login untuk memulai sesi' : 'Buat akun baru' }}</p>
      </div>

      <!-- Tombol Ganti View (Login/Daftar) -->
      <div class="flex justify-center">
        <div class="bg-gray-200 p-1 rounded-lg flex gap-2">
          <button
            @click="view = 'login'"
            :class="[
              'w-full px-6 py-2 rounded-md font-medium text-sm',
              view === 'login' ? 'bg-white shadow text-green-700' : 'text-gray-600'
            ]"
          >
            Login
          </button>
          <button
            @click="view = 'register'"
            :class="[
              'w-full px-6 py-2 rounded-md font-medium text-sm',
              view === 'register' ? 'bg-white shadow text-green-700' : 'text-gray-600'
            ]"
          >
            Daftar
          </button>
        </div>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Error Message -->
        <div v-if="errorMsg" class="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
          {{ errorMsg }}
        </div>
        
        <!-- (BARU) Input Nama Lengkap (Hanya saat Daftar) -->
        <div v-if="view === 'register'">
          <label for="name" class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input
            v-model="form.full_name"
            id="name"
            type="text"
            :required="view === 'register'"
            class="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nama lengkap Anda"
          />
        </div>

        <!-- Input Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="form.email"
            id="email"
            type="email"
            required
            class="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="nama@email.com"
          />
        </div>
        
        <!-- Input Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="form.password"
            id="password"
            type="password"
            required
            class="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <!-- (BARU) Input No. Telepon (Hanya saat Daftar) -->
        <div v-if="view === 'register'">
          <label for="phone" class="block text-sm font-medium text-gray-700">No. Telepon (WhatsApp)</label>
          <input
            v-model="form.phone"
            id="phone"
            type="tel"
            :required="view === 'register'"
            class="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="0812..."
          />
        </div>

        <!-- (BARU) Input Jenis Kelamin (Hanya saat Daftar) -->
        <div v-if="view === 'register'">
          <label for="gender" class="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
          <select
            v-model="form.gender"
            id="gender"
            :required="view === 'register'"
            class="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="pria">Pria</option>
            <option value="wanita">Wanita</option>
          </select>
        </div>
        
        <!-- Tombol Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-gray-400"
        >
          <span v-if="loading">Memproses...</span>
          <span v-else>{{ view === 'login' ? 'Login' : 'Daftar Sekarang' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { supabase } from '../supabaseClient'
import { useRouter } from 'vue-router'

// (BARU) Fungsi untuk mereset form
const getDefaultFormState = () => ({
  email: '',
  password: '',
  full_name: '',
  phone: '',
  gender: 'pria' // Default value
})

export default {
  setup() {
    const view = ref('login') // 'login' or 'register'
    const router = useRouter()
    const form = ref(getDefaultFormState())
    const loading = ref(false)
    const errorMsg = ref(null)

    // (BARU) Awasi perubahan view, reset form jika berganti
    watch(view, () => {
      form.value = getDefaultFormState()
      errorMsg.value = null
    })

    const handleSubmit = async () => {
      loading.value = true
      errorMsg.value = null
      try {
        if (view.value === 'login') {
          // Logic Login (Tidak berubah)
          const { data, error } = await supabase.auth.signInWithPassword({
            email: form.value.email,
            password: form.value.password,
          })
          if (error) throw error
          
          const user = data.user
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
            
          if (profile?.role === 'admin') {
            router.push({ name: 'Admin' })
          } else {
            router.push({ name: 'Pos' })
          }

        } else {
          // (UPDATE) Logic Daftar
          const { error } = await supabase.auth.signUp({
            email: form.value.email,
            password: form.value.password,
            // (BARU) Kirim data ekstra ke Supabase
            // Ini akan ditangkap oleh function SQL 'create_profile_on_signup'
            options: {
              data: {
                full_name: form.value.full_name,
                phone: form.value.phone,
                gender: form.value.gender
              }
            }
          })
          if (error) throw error
          alert('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi (jika diaktifkan), lalu login.')
          view.value = 'login' // Arahkan ke tab login
        }
      } catch (error) {
        errorMsg.value = `Error: ${error.message}`
      } finally {
        loading.value = false
      }
    }

    return {
      view,
      form,
      loading,
      errorMsg,
      handleSubmit
    }
  }
}
</script>

