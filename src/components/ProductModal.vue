<!-- 
  src/components/ProductModal.vue
  Modal form untuk Tambah & Edit Produk di CMS (Fase 4.B)
-->
<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">
      <h2 class="text-2xl font-bold mb-4">
        {{ isEditMode ? 'Edit Produk' : 'Tambah Produk Baru' }}
      </h2>

      <form @submit.prevent="submitForm">
        <!-- Nama Produk -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Nama Produk</label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <!-- Harga -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Harga</label>
          <input 
            v-model.number="form.price" 
            type="number" 
            required 
            min="0"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <!-- Kategori -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Kategori</label>
          <select 
            v-model="form.category" 
            required
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
          >
            <option value="fnb">F&B (Makanan & Minuman)</option>
            <option value="laundry-kiloan">Laundry Kiloan</option>
            <option value="laundry-satuan">Laundry Satuan</option>
            <option value="retail">Retail (Barang)</option>
          </select>
        </div>

        <!-- URL Gambar -->
        <div class="mb-4">
          <label class="block text-sm font-medium">URL Gambar (Opsional)</label>
          <input 
            v-model="form.image_url" 
            type="text" 
            placeholder="https://..."
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
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
            {{ loading ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'

export default {
  props: {
    show: Boolean,
    loading: Boolean,
    productToEdit: Object // null (create) atau Object (edit)
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

    // Cek apakah mode Edit
    const isEditMode = computed(() => !!props.productToEdit);

    // Awasi (watch) prop 'productToEdit'
    watch(() => props.productToEdit, (newProduct) => {
      if (newProduct) {
        // Mode Edit: Isi form dari prop
        form.value = { ...newProduct };
      } else {
        // Mode Create: Reset form
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
      // Kirim data form ke 'Products.vue' untuk disimpan
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

