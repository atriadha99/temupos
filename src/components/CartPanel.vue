<!-- 
  src/components/CartPanel.vue
  (UPDATE) Tampilkan poin & level pelanggan terpilih
-->
<template>
  <!-- ... (Template <div ... h2 ... div v-if="cart.length === 0" ... div v-else ... hr ... tidak berubah) ... -->
  [Immersive content redacted for brevity.]
    <hr class="my-3" />

    <!-- (BARU) Area Pelanggan -->
    <div class="mb-3">
      <label class="text-sm font-medium text-gray-700">Pelanggan</label>
      <div v-if="selectedCustomer" class="mt-1 flex justify-between items-center p-3 bg-green-50 rounded-lg">
        <div>
          <p class="font-medium text-green-800">{{ selectedCustomer.name }}</p>
          <p class="text-sm text-green-700">{{ selectedCustomer.phone }}</p>
          <!-- (BARU) Tampilkan poin & level -->
          <p class="text-xs text-blue-600 font-medium mt-1">
            {{ selectedCustomer.points }} Poin ({{ selectedCustomer.member_level }})
          </p>
        </div>
        <button @click="$emit('clear-customer')" class="text-xs text-red-500 hover:underline self-start">Ganti</button>
      </div>
      <button 
        v-else
        @click="$emit('select-customer-click')" 
        class="w-full mt-1 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 text-center"
      >
        + Pilih / Tambah Pelanggan
      </button>
    </div>

    <!-- ... (Template Metode Bayar, Total, dan Tombol Bayar tidak berubah) ... -->
  [Immersive content redacted for brevity.]
</template>

<script>
// ... (Script setup tidak perlu diubah sama sekali) ...
export default {
  props: {
    cart: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
    selectedCustomer: { type: Object, default: null },
    paymentMethod: { type: String, default: 'cash' },
    paymentMethods: { type: Array, default: () => [] }
  },
  emits: [
    'increase', 'decrease', 'remove', 'checkout', 
    'select-customer-click', 'clear-customer', 'payment-change'
  ]
}
</script>

