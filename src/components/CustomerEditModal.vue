<template>
  <!-- 
    src/components/CustomerEditModal.vue
    (REFACTOR) Menggunakan Chakra UI <CModal>
  -->
  <CModal :is-open="show" @close="$emit('close')" is-centered>
    <CModalOverlay />
    <CModalContent max-w="lg">
      <CModalHeader>Edit Pelanggan</CModalHeader>
      <CModalCloseButton />
      
      <form v-if="form" @submit.prevent="submitForm">
        <CModalBody>
          <CStack spacing="4">
            <CFormControl is-required>
              <CFormLabel>Nama Pelanggan</CFormLabel>
              <CInput v-model="form.name" />
            </CFormControl>

            <CFormControl is-required>
              <CFormLabel>No. HP</CFormLabel>
              <CInput v-model="form.phone" type="tel" />
            </CFormControl>
            
            <CFormControl>
              <CFormLabel>Email (Opsional)</CFormLabel>
              <CInput v-model="form.email" type="email" />
            </CFormControl>
            
            <CDivider />

            <CFormControl is-required>
              <CFormLabel>Poin Loyalitas</CFormLabel>
              <CInput v-model.number="form.points" type="number" min="0" />
              <CFormHelperText>
                Admin bisa menambah atau mengurangi poin (redeem) secara manual.
              </CFormHelperText>
            </CFormControl>

            <CFormControl is-required>
              <CFormLabel>Level Member</CFormLabel>
              <CSelect v-model="form.member_level">
                <option value="standard">Standard</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </CSelect>
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
            Simpan Perubahan
          </CButton>
        </CModalFooter>
      </form>
    </CModalContent>
  </CModal>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
import { ref, watch } from 'vue'

export default {
  props: {
    show: Boolean,
    loading: Boolean,
    customerToEdit: Object
  },
  emits: ['close', 'save'],
  
  setup(props, { emit }) {
    const form = ref(null);

    watch(() => props.customerToEdit, (newCustomer) => {
      if (newCustomer) {
        form.value = { ...newCustomer };
      } else {
        form.value = null;
      }
    });

    const submitForm = () => {
      emit('save', { ...form.value });
    }

    return {
      form,
      submitForm
    }
  }
}
</script>