<template>
  <!-- 
    src/components/ProductModal.vue
    (REFACTOR) Menggunakan Chakra UI <CModal>
  -->
  <CModal :is-open="show" @close="$emit('close')" is-centered>
    <CModalOverlay />
    <CModalContent max-w="lg">
      <CModalHeader>
        {{ isEditMode ? 'Edit Produk' : 'Tambah Produk Baru' }}
      </CModalHeader>
      <CModalCloseButton />
      
      <form @submit.prevent="submitForm">
        <CModalBody>
          <CStack spacing="4">
            <CFormControl is-required>
              <CFormLabel>Nama Produk</CFormLabel>
              <CInput v-model="form.name" />
            </CFormControl>

            <CFormControl is-required>
              <CFormLabel>Harga</CFormLabel>
              <CInput v-model.number="form.price" type="number" min="0" />
            </CFormControl>
            
            <CFormControl is-required>
              <CFormLabel>Kategori</CFormLabel>
              <CSelect v-model="form.category">
                <option value="fnb">F&B (Makanan & Minuman)</option>
                <option value="laundry-kiloan">Laundry Kiloan</option>
                <option value="laundry-satuan">Laundry Satuan</option>
                <option value="retail">Retail (Barang)</option>
              </CSelect>
            </CFormControl>

            <CFormControl>
              <CFormLabel>URL Gambar (Opsional)</CFormLabel>
              <CInput v-model="form.image_url" placeholder="https://..." />
            </CFormControl>
          </CStack>
        </CModalBody>

        <CModalFooter>
          <CButton variant="ghost" @click="$emit('close')">Batal</CButton>
          <CButton
            type="submit"
            color-scheme="green"
            ml="3"
            :is-loading="loading"
          >
            Simpan
          </CButton>
        </CModalFooter>
      </form>
    </CModalContent>
  </CModal>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
import { ref, watch, computed } from 'vue'

export default {
  props: {
    show: Boolean,
    loading: Boolean,
    productToEdit: Object
  },
  emits: ['close', 'save'],
  
  setup(props, { emit }) {
    const form = ref({
      id: null,
      name: '',
      price: 0,
      category: 'fnb',
      image_url: ''
    });

    const isEditMode = computed(() => !!props.productToEdit);

    watch(() => props.productToEdit, (newProduct) => {
      if (newProduct) {
        form.value = { ...newProduct };
      } else {
        form.value = {
          id: null,
          name: '',
          price: 0,
          category: 'fnb',
          image_url: ''
        };
      }
    });

    const submitForm = () => {
      emit('save', { ...form.value });
    }

    return {
      form,
      isEditMode,
      submitForm
    }
  }
}
</script>