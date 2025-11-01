<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="flex min-h-screen">
    <!-- Sidebar Navigasi -->
    <div class="w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-yellow-400">🔑 CMS TemuPOS</h1>
        <p class="text-sm text-gray-400">Admin Dashboard</p>
      </div>
      
      <nav class="flex-1 px-4 py-2 space-y-2">
        <router-link 
          to="/admin/reports" 
          class="flex items-center px-3 py-2 rounded-lg"
          active-class="bg-gray-700 text-yellow-400"
          exact-active-class="bg-gray-700 text-yellow-400"
        >
          <span class="mr-3 text-xl">📊</span>
          Laporan
        </router-link>
        
        <router-link 
          to="/admin/products" 
          class="flex items-center px-3 py-2 rounded-lg"
          active-class="bg-gray-700 text-yellow-400"
          exact-active-class="bg-gray-700 text-yellow-400"
        >
          <span class="mr-3 text-xl">📦</span>
          Produk
        </router-link>

        <router-link 
          to="/admin/customers" 
          class="flex items-center px-3 py-2 rounded-lg"
          active-class="bg-gray-700 text-yellow-400"
          exact-active-class="bg-gray-700 text-yellow-400"
        >
          <span class="mr-3 text-xl">👥</span>
          Pelanggan
        </router-link>
      </nav>

      <!-- Footer Sidebar -->
      <div class="p-4 border-t border-gray-700">
        <router-link to="/" class="block text-center text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 mb-2">
          Kembali ke POS
        </router-link>
        <button @click="handleLogout" class="w-full text-sm bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700">
          Logout
        </button>
      </div>
    </div>
    
    <!-- Area Konten Utama -->
    <div class="flex-1 bg-gray-100 p-8 overflow-y-auto">
      <router-view />
    </div>
  </div>
</template>

<script>
import { supabase } from '../supabaseClient'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    const handleLogout = async () => {
      if (confirm('Anda yakin ingin logout dari CMS?')) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          // PERBAIKAN: Tanda kutip 'H' salah, seharusnya '+'
          alert('Gagal logout: ' + error.message)
        } else {
          router.push({ name: 'Login' })
        }
      }
    }

    return {
      handleLogout
    }
  }
}
</script>

