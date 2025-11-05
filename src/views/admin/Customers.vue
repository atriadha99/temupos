<template>
  <!-- 
    src/views/admin/Customers.vue
    (REFACTOR) Menggunakan Chakra UI <CInput> & <CTable>
  -->
  <CBox>
    <CFlex justify="space-between" align="center" mb="6">
      <CHeading as="h1" size="xl">Manajemen Pelanggan</CHeading>
    </CFlex>

    <CBox mb="4">
      <CInput
        v-model="searchTerm"
        @input="debounceSearch"
        placeholder="Cari pelanggan (nama atau no. hp)..."
        max-w="lg"
        bg="white"
      />
    </CBox>

    <!-- Tabel Pelanggan -->
    <CBox bg="white" rounded="xl" shadow="md" overflow="hidden">
      <CText v-if="loading" p="6" text-align="center" color="gray.500">
        Memuat data pelanggan...
      </CText>
      
      <CText v-else-if="customers.length === 0" p="6" text-align="center" color="gray.500">
        {{ searchTerm ? 'Pelanggan tidak ditemukan.' : 'Belum ada data pelanggan.' }}
      </CText>
      
      <CTableContainer v-else>
        <CTable variant="simple">
          <CThead bg="gray.50">
            <CTr>
              <CTh>Nama</CTh>
              <CTh>Kontak</CTh>
              <CTh is-numeric>Poin</CTh>
              <CTh>Level</CTh>
              <CTh text-align="right">Aksi</CTh>
            </CTr>
          </CThead>
          <CTbody>
            <CTr v-for="customer in customers" :key="customer.id">
              <CTd font-weight="medium">{{ customer.name }}</CTd>
              <CTd font-size="sm" color="gray.600">
                <CText>{{ customer.phone }}</CText>
                <CText font-size="xs">{{ customer.email || '-' }}</CText>
              </CTd>
              <CTd is-numeric font-weight="bold" color="blue.600">
                {{ customer.points }}
              </CTd>
              <CTd>
                <CTag :color-scheme="levelBadge(customer.member_level)">
                  {{ customer.member_level.toUpperCase() }}
                </CTag>
              </CTd>
              <CTd text-align="right">
                <CButton 
                  variant="ghost" 
                  color-scheme="yellow" 
                  size="sm"
                  @click="handleEdit(customer)"
                >
                  Edit
                </CButton>
              </CTd>
            </CTr>
          </CTbody>
        </CTable>
      </CTableContainer>
    </CBox>

    <!-- 
      Modal untuk Edit
      (Komponen CustomerEditModal sudah di-refactor)
    -->
    <CustomerEditModal
      :show="showModal"
      :loading="loadingModal"
      :customerToEdit="customerToEdit"
      @close="showModal = false"
      @save="handleSave"
    />

  </CBox>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
import { ref, onMounted } from 'vue'
import { supabase } from '../../supabaseClient'
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
          query = query.or(name.ilike.%${searchTerm.value}%,phone.ilike.%${searchTerm.value}%)
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
        alert(Data pelanggan ${customerData.name} berhasil diperbarui!)
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
        case 'standard': return 'gray'
        case 'gold': return 'yellow'
        case 'platinum': return 'purple'
        default: return 'gray'
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