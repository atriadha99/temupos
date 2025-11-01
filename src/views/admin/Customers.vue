<!-- eslint-disable vue/multi-word-component-names -->
<!-- 
  src/views/admin/Customers.vue
  (BARU) Halaman CMS untuk mengelola pelanggan
-->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Manajemen Pelanggan</h1>
    </div>

    <div class="mb-4">
      <input 
        v.model="searchTerm"
        @input="debounceSearch"
        type="text"
        placeholder="Cari pelanggan (nama atau no. hp)..."
        class="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
      />
    </div>

    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-gray-500">
        Memuat data pelanggan...
      </div>
      
      <div v-else-if="customers.length === 0" class="p-6 text-center text-gray-500">
        {{ searchTerm ? 'Pelanggan tidak ditemukan.' : 'Belum ada data pelanggan.' }}
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poin</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in customers" :key="customer.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-gray-900">{{ customer.name }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <div>{{ customer.phone }}</div>
                <div class="text-xs">{{ customer.email || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                {{ customer.points }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', levelBadge(customer.member_level)]">
                  {{ customer.member_level.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="handleEdit(customer)" 
                  class="text-yellow-600 hover:text-yellow-900 mr-4"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <CustomerEditModal
      :show="showModal"
      :loading="loadingModal"
      :customerToEdit="customerToEdit"
      @close="showModal = false"
      @save="handleSave"
    />

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '../../supabaseClient'
// Ini akan mencari file di LANGKAH B
import CustomerEditModal from '../../components/CustomerEditModal.vue'

export default {
  components: {
    CustomerEditModal
  },
  
  setup() {
    const customers = ref([])
    const loading = ref(true)
    const searchTerm = ref('')
    let searchTimeout = null
    
    const showModal = ref(false)
    const loadingModal = ref(false)
    const customerToEdit = ref(null)

    const fetchCustomers = async () => {
      loading.value = true
      try {
        let query = supabase
          .from('customers')
          .select('*')
          .order('name', { ascending: true })

        if (searchTerm.value.length > 1) {
          query = query.or(`name.ilike.%${searchTerm.value}%,phone.ilike.%${searchTerm.value}%`)
        }

        const { data, error } = await query

        if (error) throw error
        customers.value = data
      } catch (error) {
        alert('Gagal ambil data pelanggan: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    const debounceSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        fetchCustomers()
      }, 300)
    }

    const handleEdit = (customer) => {
      customerToEdit.value = { ...customer } 
      showModal.value = true
    }

    const handleSave = async (formData) => {
      loadingModal.value = true
      
      const { id, ...customerData } = formData

      try {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', id)

        if (error) throw error
        
        alert(`Data pelanggan ${customerData.name} berhasil diperbarui!`)
        showModal.value = false
        await fetchCustomers()

      } catch (error) {
        alert('Gagal menyimpan data: ' + error.message)
      } finally {
        loadingModal.value = false
      }
    }
    
    const levelBadge = (level) => {
      switch (level) {
        case 'standard': return 'bg-gray-100 text-gray-800'
        case 'gold': return 'bg-yellow-100 text-yellow-800'
        case 'platinum': return 'bg-purple-100 text-purple-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    onMounted(() => {
      fetchCustomers()
    })

    return {
      customers,
      loading,
      searchTerm,
      debounceSearch,
      showModal,
      loadingModal,
      customerToEdit,
      handleEdit,
      handleSave,
      levelBadge
    }
  }
}
</script>

