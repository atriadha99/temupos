<!-- 
  src/components/CustomerEditModal.vue
  (BARU) Modal form untuk Edit Pelanggan (Poin, Level, dll)
-->
<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">
      <h2 class="text-2xl font-bold mb-4">
        Edit Pelanggan
      </h2>

      <form v-if="form" @submit.prevent="submitForm">
        <!-- Nama Pelanggan -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Nama Pelanggan</label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <!-- No. HP -->
        <div class="mb-3">
          <label class="block text-sm font-medium">No. HP</label>
          <input 
            v-model="form.phone" 
            type="tel" 
            required
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <!-- Email -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Email (Opsional)</label>
          <input 
            v-model="form.email" 
            type="email"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <hr class="my-4" />

        <!-- Poin (Redeem/Tambah Manual) -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Poin Loyalitas</label>
          <input 
            v.model.number="form.points" 
            type="number" 
            required 
            min="0"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <p class="text-xs text-gray-500 mt-1">Admin bisa menambah atau mengurangi poin (redeem) secara manual.</p>
        </div>

        <!-- Level Member -->
        <div class="mb-4">
          <label class="block text-sm font-medium">Level Member</label>
          <select 
            v.model="form.member_level" 
            required
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
          >
            <option value="standard">Standard</option>
            <option value="gold">Gold</option>
            <option value_alias="platinum">Platinum</option>
          </select>
        </div>

        <!-- Tombol Aksi -->
        <div class="flex justify-end gap-3">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
          <button 
            type="submit" 
            :disabled="loading"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  props: {
    show: Boolean,
    loading: Boolean,
    customerToEdit: Object // null atau Object
  },
  emits: ['close', 'save'],
  
  setup(props, { emit }) {
    const form = ref(null);

    // Awasi (watch) prop 'customerToEdit'
    // Jika berubah (dibuka untuk edit), isi form-nya
    watch(() => props.customerToEdit, (newCustomer) => {
      if (newCustomer) {
        // Mode Edit: Isi form dari prop
        form.value = { ...newCustomer };
      } else {
        // Mode Create: Reset form
        form.value = null;
      }
    });

    const submitForm = () => {
      // Kirim data form ke 'Customers.vue' untuk disimpan
      emit('save', { ...form.value });
    }

    return {
      form,
      submitForm
    }
  }
}
</script>

