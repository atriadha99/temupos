<template>
  <!-- 
    src/components/CustomerModal.vue
    (REFACTOR) Menggunakan Chakra UI <CModal>
  -->
  <CModal :is-open="show" @close="$emit('close')" is-centered scroll-behavior="inside">
    <CModalOverlay />
    <CModalContent max-w="lg">
      <CModalHeader>Pilih Pelanggan</CModalHeader>
      <CModalCloseButton />
      
      <CModalBody p="0">
        <CTabs is-fitted color-scheme="green">
          <CTabList mb="1px">
            <CTab>Cari Pelanggan</CTab>
            <CTab>Pelanggan Baru</CTab>
          </CTabList>
          
          <CTabPanels p="6">
            <!-- Panel 1: Pencarian -->
            <CTabPanel>
              <CFormControl>
                <CFormLabel>Cari Pelanggan (Nama / No. HP)</CFormLabel>
                <CInput
                  v-model="searchTerm"
                  @input="debounceSearch"
                  type="text"
                  placeholder="Ketik nama atau nomor HP..."
                />
              </CFormControl>
              
              <!-- Hasil Pencarian -->
              <CBox max-h="60" overflow-y="auto" mt="4">
                <CText v-if="loadingSearch" color="gray.500" font-size="sm">
                  Mencari...
                </CText>
                <CText v-else-if="!loadingSearch && searchResults.length === 0 && searchTerm.length > 0" color="gray.500" font-size="sm">
                  Pelanggan tidak ditemukan.
                </CText>
                
                <CBox
                  v-for="customer in searchResults"
                  :key="customer.id"
                  p="3"
                  rounded="lg"
                  cursor="pointer"
                  :_hover="{ bg: 'gray.100' }"
                  @click="selectCustomer(customer)"
                >
                  <CFlex justify="space-between" align="center">
                    <CBox>
                      <CText font-weight="medium">{{ customer.name }}</CText>
                      <CText font-size="sm" color="gray.600">{{ customer.phone }}</CText>
                    </CBox>
                    <CButton size="sm" color-scheme="green" variant="outline">
                      Pilih
                    </CButton>
                  </CFlex>
                </CBox>
              </CBox>
            </CTabPanel>

            <!-- Panel 2: Buat Baru -->
            <CTabPanel>
              <form @submit.prevent="handleCreateCustomer">
                <CStack spacing="4">
                  <CFormControl is-required>
                    <CFormLabel>Nama</CFormLabel>
                    <CInput v-model="newName" type="text" />
                  </CFormControl>
                  <CFormControl is-required>
                    <CFormLabel>Nomor HP (cth: 0812...)</CFormLabel>
                    <CInput v-model="newPhone" type="tel" />
                  </CFormControl>
                  
                  <CAlert v-if="createError" status="error" rounded="md">
                    <CAlertIcon />
                    {{ createError }}
                  </CAlert>
                  
                  <CButton
                    type="submit"
                    color-scheme="green"
                    :is-loading="loadingCreate"
                  >
                    {{ loadingCreate ? 'Menyimpan...' : 'Simpan Pelanggan' }}
                  </CButton>
                </CStack>
              </form>
            </CTabPanel>
          </CTabPanels>
        </CTabs>
      </CModalBody>
    </CModalContent>
  </CModal>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
import { ref } from 'vue'
import { supabase } from '../supabaseClient'

export default {
  props: ['show'],
  emits: ['close', 'customer-selected'],
  
  setup(props, { emit }) {
    const searchTerm = ref('')
    const searchResults = ref([])
    const loadingSearch = ref(false)
    let searchTimeout = null

    const newName = ref('')
    const newPhone = ref('')
    const loadingCreate = ref(false)
    const createError = ref(null)

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
          .or(name.ilike.%${searchTerm.value}%,phone.ilike.%${searchTerm.value}%)
          .limit(10)
        
        if (error) throw error
        searchResults.value = data
      } catch (error) {
        console.error("Gagal cari pelanggan:", error.message)
      } finally {
        loadingSearch.value = false
      }
    }

    const debounceSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        searchCustomers()
      }, 300)
    }

    const handleCreateCustomer = async () => {
      loadingCreate.value = true
      createError.value = null
      try {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', newPhone.value)
          .single()

        if (existing) {
          throw new Error('Nomor HP sudah terdaftar.')
        }

        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert({ name: newName.value, phone: newPhone.value })
          .select()
          .single()

        if (error) throw error
        
        alert('Pelanggan baru berhasil dibuat!')
        selectCustomer(newCustomer)

      } catch (error) {
        createError.value = error.message
      } finally {
        loadingCreate.value = false
      }
    }

    const selectCustomer = (customer) => {
      emit('customer-selected', customer)
      searchTerm.value = ''
      searchResults.value = []
      newName.value = ''
      newPhone.value = ''
      emit('close')
    }

    return {
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