<!-- 
  src/components/CustomerModal.vue
  (BARU) Modal untuk cari / tambah pelanggan.
-->
<template>
  <!-- Latar belakang gelap -->
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Konten Modal -->
    <div class="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">
      
      <!-- Tab (Cari / Buat Baru) -->
      <div class="flex border-b mb-4">
        <button 
          :class="['py-2 px-4 -mb-px', view === 'search' ? 'font-bold border-b-2 border-green-600 text-green-600' : 'text-gray-500']"
          @click="view = 'search'"
        >
          Cari Pelanggan
        </button>
        <button 
          :class="['py-2 px-4 -mb-px', view === 'create' ? 'font-bold border-b-2 border-green-600 text-green-600' : 'text-gray-500']"
          @click="view = 'create'"
        >
          Pelanggan Baru
        </button>
      </div>

      <!-- Tampilan 1: Pencarian -->
      <div v-if="view === 'search'">
        <h3 class="text-lg font-bold mb-3">Cari Pelanggan (Nama / No. HP)</h3>
        <input
          v-model="searchTerm"
          @input="debounceSearch"
          type="text"
          placeholder="Ketik nama atau nomor HP..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <!-- Hasil Pencarian -->
        <div class="max-h-60 overflow-y-auto mt-3">
          <p v-if="loadingSearch" class="text-gray-500 text-sm">Mencari...</p>
          <p v-else-if="!loadingSearch && searchResults.length === 0 && searchTerm.length > 0" class="text-gray-500 text-sm">
            Pelanggan tidak ditemukan.
          </p>
          <div 
            v-for="customer in searchResults" 
            :key="customer.id"
            class="p-3 hover:bg-gray-100 rounded-lg cursor-pointer flex justify-between items-center"
            @click="selectCustomer(customer)"
          >
            <div>
              <p class="font-medium">{{ customer.name }}</p>
              <p class="text-sm text-gray-600">{{ customer.phone }}</p>
            </div>
            <button class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              Pilih
            </button>
          </div>
        </div>
      </div>

      <!-- Tampilan 2: Buat Baru -->
      <div v-if="view === 'create'">
        <h3 class="text-lg font-bold mb-3">Buat Pelanggan Baru</h3>
        <form @submit.prevent="handleCreateCustomer">
          <div class="mb-3">
            <label class="block text-sm font-medium">Nama</label>
            <input v-model="newName" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium">Nomor HP (cth: 0812...)</label>
            <input v-model="newPhone" type="tel" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <p v-if="createError" class="text-red-500 text-sm mb-3">{{ createError }}</p>
          <button 
            type="submit" 
            :disabled="loadingCreate"
            class="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
          >
            {{ loadingCreate ? 'Menyimpan...' : 'Simpan Pelanggan' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { supabase } from '../supabaseClient'

export default {
  props: ['show'],
  emits: ['close', 'customer-selected'],
  
  setup(props, { emit }) {
    const view = ref('search') // 'search' atau 'create'
    const searchTerm = ref('')
    const searchResults = ref([])
    const loadingSearch = ref(false)
    let searchTimeout = null

    const newName = ref('')
    const newPhone = ref('')
    const loadingCreate = ref(false)
    const createError = ref(null)

    // Fungsi untuk cari customer
    const searchCustomers = async () => {
      if (searchTerm.value.length < 2) {
        searchResults.value = []
        return
      }
      loadingSearch.value = true
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          // Cari berdasarkan nama ATAU nomor HP
          .or(`name.ilike.%${searchTerm.value}%,phone.ilike.%${searchTerm.value}%`)
          .limit(10)
        
        if (error) throw error
        searchResults.value = data
      } catch (error) {
        console.error("Gagal cari pelanggan:", error.message)
      } finally {
        loadingSearch.value = false
      }
    }

    // Debounce agar tidak query database di setiap ketikan
    const debounceSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        searchCustomers()
      }, 300) // Jeda 300ms
    }

    // Fungsi untuk buat customer baru
    const handleCreateCustomer = async () => {
      loadingCreate.value = true
      createError.value = null
      try {
        // Cek dulu apakah nomor HP sudah ada
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', newPhone.value)
          .single()

        if (existing) {
          throw new Error('Nomor HP sudah terdaftar.')
        }

        // Jika belum, buat baru
        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert({ name: newName.value, phone: newPhone.value })
          .select() // Ambil data yg baru dibuat
          .single() // Ambil sebagai objek

        if (error) throw error
        
        alert('Pelanggan baru berhasil dibuat!')
        selectCustomer(newCustomer) // Langsung pilih pelanggan baru

      } catch (error) {
        createError.value = error.message
      } finally {
        loadingCreate.value = false
      }
    }

    // Fungsi untuk memilih customer
    const selectCustomer = (customer) => {
      emit('customer-selected', customer)
      // Reset form & tutup modal
      searchTerm.value = ''
      searchResults.value = []
      newName.value = ''
      newPhone.value = ''
      view.value = 'search'
      emit('close')
    }

    return {
      view,
      searchTerm,
      searchResults,
      loadingSearch,
      debounceSearch,
      newName,
      newPhone,
      loadingCreate,
      createError,
      handleCreateCustomer,
      selectCustomer
    }
  }
}
</script>

