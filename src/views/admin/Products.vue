<template>
  <!-- 
    src/views/admin/Products.vue
    (REFACTOR) Menggunakan Chakra UI <CButton> & <CTable>
  -->
  <CBox>
    <CFlex justify="space-between" align="center" mb="6">
      <CHeading as="h1" size="xl">Manajemen Produk</CHeading>
      <CButton 
        color-scheme="green"
        left-icon="add"
        @click="handleAddNew"
      >
        Tambah Produk Baru
      </CButton>
    </CFlex>

    <!-- Tabel Produk -->
    <CBox bg="white" rounded="xl" shadow="md" overflow="hidden">
      <CText v-if="loading" p="6" text-align="center" color="gray.500">
        Memuat data produk...
      </CText>
      
      <CText v-else-if="products.length === 0" p="6" text-align="center" color="gray.500">
        Belum ada produk. Silakan tambah produk baru.
      </CText>
      
      <CTableContainer v-else>
        <CTable variant="simple">
          <CThead bg="gray.50">
            <CTr>
              <CTh>Produk</CTh>
              <CTh>Kategori</CTh>
              <CTh is-numeric>Harga</CTh>
              <CTh text-align="right">Aksi</CTh>
            </CTr>
          </CThead>
          <CTbody>
            <CTr v-for="product in products" :key="product.id">
              <CTd>
                <CFlex align="center">
                  <CImage
                    :src="product.image_url || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=...'" 
                    :alt="product.name" 
                    size="40px"
                    rounded="md"
                    object-fit="cover"
                    mr="3"
                  />
                  <CText font-weight="medium">{{ product.name }}</CText>
                </CFlex>
              </CTd>
              <CTd font-size="sm" color="gray.600">{{ product.category }}</CTd>
              <CTd is-numeric font-weight="medium">
                Rp {{ Number(product.price).toLocaleString('id-ID') }}
              </CTd>
              <CTd text-align="right">
                <CButton variant="ghost" color-scheme="yellow" size="sm" mr="2" @click="handleEdit(product)">
                  Edit
                </CButton>
                <CButton variant="ghost" color-scheme="red" size="sm" @click="handleDelete(product)">
                  Hapus
                </CButton>
              </CTd>
            </CTr>
          </CTbody>
        </CTable>
      </CTableContainer>
    </CBox>

    <!-- 
      Modal untuk Tambah/Edit
      (Komponen ProductModal sudah di-refactor)
    -->
    <ProductModal
      :show="showModal"
      :loading="loadingModal"
      :productToEdit="productToEdit"
      @close="showModal = false"
      @save="handleSave"
    />

  </CBox>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
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
    const showModal = ref(false)
    const loadingModal = ref(false)
    const productToEdit = ref(null)

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

    const handleAddNew = () => {
      productToEdit.value = null
      showModal.value = true
    }

    const handleEdit = (product) => {
      productToEdit.value = { ...product } 
      showModal.value = true
    }

    const handleDelete = async (product) => {
      if (!confirm(Anda yakin ingin menghapus "${product.name}"?\n\nData ini tidak bisa dikembalikan.)) {
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

    const handleSave = async (formData) => {
      loadingModal.value = true
      const { id, ...productData } = formData
      try {
        let error;
        if (id) {
          const { error: updateError } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
          error = updateError
        } else {
          const { error: insertError } = await supabase
            .from('products')
            .insert(productData)
          error = insertError
        }
        if (error) throw error
        alert(Produk berhasil ${id ? 'diperbarui' : 'ditambahkan'}!)
        showModal.value = false
        await fetchProducts()
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
      products,
      loading,
      showModal,
      loadingModal,
      productToEdit,
      handleAddNew,
      handleEdit,
      handleDelete,
      handleSave
    }
  }
}
</script>