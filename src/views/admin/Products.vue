<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Manajemen Produk</h1>
      <button 
        @click="handleAddNew"
        class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 font-medium shadow"
      >
        + Tambah Produk Baru
      </button>
    </div>

    <!-- Tabel Produk -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-gray-500">
        Memuat data produk...
      </div>
      
      <div v-else-if="products.length === 0" class="p-6 text-center text-gray-500">
        Belum ada produk. Silakan tambah produk baru.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img 
                    :src="product.image_url || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=...'" 
                    :alt="product.name" 
                    class="w-10 h-10 rounded object-cover mr-3"
                  />
                  <span class="font-medium text-gray-900">{{ product.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ product.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                Rp {{ Number(product.price).toLocaleString('id-ID') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="handleEdit(product)" 
                  class="text-yellow-600 hover:text-yellow-900 mr-4"
                >
                  Edit
                </button>
                <button 
                  @click="handleDelete(product)" 
                  class="text-red-600 hover:text-red-900"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal untuk Tambah/Edit -->
    <ProductModal
      :show="showModal"
      :loading="loadingModal"
      :productToEdit="productToEdit"
      @close="showModal = false"
      @save="handleSave"
    />

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '../../supabaseClient'
import ProductModal from '../../components/ProductModal.vue'

export default {
  components: {
    ProductModal
  },
  
  setup() {
    const products = ref([])
    const loading = ref(true)
    
    // State untuk Modal
    const showModal = ref(false)
    const loadingModal = ref(false)
    const productToEdit = ref(null)

    // (R)EAD
    const fetchProducts = async () => {
      loading.value = true
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true })
        if (error) throw error
        products.value = data
      } catch (error) {
        alert('Gagal ambil data produk: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    // (C)REATE: Buka modal
    const handleAddNew = () => {
      productToEdit.value = null
      showModal.value = true
    }

    // (U)PDATE: Buka modal
    const handleEdit = (product) => {
      productToEdit.value = { ...product }
      showModal.value = true
    }

    // (D)ELETE
    const handleDelete = async (product) => {
      if (!confirm(`Anda yakin ingin menghapus "${product.name}"?\n\nData ini tidak bisa dikembalikan.`)) {
        return
      }
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id)
        if (error) throw error
        alert('Produk berhasil dihapus!')
        products.value = products.value.filter(p => p.id !== product.id)
      } catch (error) {
        alert('Gagal menghapus produk: ' + error.message)
      }
    }

    // (SAVE): Logika Create/Update
    const handleSave = async (formData) => {
      loadingModal.value = true
      const { id, ...productData } = formData

      try {
        let error;
        if (id) {
          // UPDATE
          const { error: updateError } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
          error = updateError
        } else {
          // CREATE
          const { error: insertError } = await supabase
            .from('products')
            .insert(productData)
          error = insertError
        }

        if (error) throw error
        
        alert(`Produk berhasil ${id ? 'diperbarui' : 'ditambahkan'}!`)
        showModal.value = false
        await fetchProducts() // Refresh data

      } catch (error) {
        alert('Gagal menyimpan produk: ' + error.message)
      } finally {
        loadingModal.value = false
      }
    }

    onMounted(() => {
      fetchProducts()
    })

    return {
      products, loading,
      showModal, loadingModal, productToEdit,
      handleAddNew, handleEdit, handleDelete, handleSave
    }
  }
}
</script>

