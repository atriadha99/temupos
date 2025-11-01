<!-- eslint-disable vue/multi-word-component-names -->
<!-- 
  src/views/Receipt.vue
  Template Struk untuk Print (Fase 5.A)
-->
<template>
  <div v-if="loading" class="p-4 text-center" style="font-family: 'Courier New', Courier, monospace;">
    Memuat data struk...
  </div>
  
  <div v-else-if="error" class="p-4 text-center text-red-500" style="font-family: 'Courier New', Courier, monospace;">
    Gagal memuat data: {{ error }}
  </div>

  <!-- Kontainer struk, beri style inline agar prioritas saat print -->
  <div v-else-if="transaction" id="receipt-container" class="p-2" style="width: 300px; font-family: 'Courier New', Courier, monospace; color: #000; font-size: 12px; line-height: 1.4;">
    <div class="text-center mb-2">
      <h1 style="font-size: 16px; font-weight: bold;">TemuPOS</h1>
      <p>Jl. Visi Masa Depan No. 1</p>
      <p>Depok, Indonesia</p>
    </div>

    <hr style="border-top: 1px dashed #000; margin-top: 8px; margin-bottom: 8px;" />

    <div>
      <p>ID Struk: #{{ transaction.id }}</p>
      <p>Tanggal: {{ new Date(transaction.created_at).toLocaleString('id-ID') }}</p>
      <p>Kasir: {{ transaction.cashier?.email || 'N/A' }}</p>
      <p v-if="transaction.customer">Pelanggan: {{ transaction.customer.name }}</p>
    </div>

    <hr style="border-top: 1px dashed #000; margin-top: 8px; margin-bottom: 8px;" />

    <!-- Daftar Item -->
    <div v-for="item in transaction.items" :key="item.name" class="mb-1">
      <p style="font-weight: 500;">{{ item.name }}</p>
      <div style="display: flex; justify-content: space-between;">
        <span>&nbsp;&nbsp;{{ item.qty }} x {{ formatCurrency(item.price) }}</span>
        <span>{{ formatCurrency(item.subtotal) }}</span>
      </div>
    </div>

    <hr style="border-top: 1px dashed #000; margin-top: 8px; margin-bottom: 8px;" />

    <!-- Total -->
    <div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
        <span>TOTAL</span>
        <span>{{ formatCurrency(transaction.total_amount) }}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>BAYAR ({{ transaction.payment_method.toUpperCase() }})</span>
        <span>{{ formatCurrency(transaction.total_amount) }}</span>
      </div>
    </div>
    
    <hr style="border-top: 1px dashed #000; margin-top: 8px; margin-bottom: 8px;" />

    <p class="text-center mt-2" style="text-align: center; margin-top: 8px;">
      ** Terima Kasih **
    </p>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabaseClient'

export default {
  setup() {
    const route = useRoute()
    const transaction = ref(null)
    const loading = ref(true)
    const error = ref(null)

    const formatCurrency = (val) => {
      return Number(val).toLocaleString('id-ID')
    }

    const fetchReceiptData = async () => {
      loading.value = true
      error.value = null
      try {
        const transactionId = route.params.id
        if (!transactionId) throw new Error('ID Transaksi tidak ditemukan')

        // Panggil fungsi SQL
        const { data, error: rpcError } = await supabase.rpc('get_transaction_details', {
          p_transaction_id: transactionId
        })
        
        if (rpcError) throw rpcError
        if (!data) throw new Error('Data transaksi tidak ditemukan')

        transaction.value = data
        
        // Tunggu DOM selesai di-render dengan data
        await nextTick()
        
        // Panggil dialog print
        window.print()
        
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchReceiptData()
    })

    return {
      transaction,
      loading,
      error,
      formatCurrency
    }
  }
}
</script>

<style>
/* CSS khusus untuk halaman print */
@media print {
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    margin: 0;
    padding: 0;
  }
  /* Sembunyikan semua kecuali kontainer struk */
  body > *:not(#receipt-container) {
    display: none;
  }
  #receipt-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  /* Paksa teks hitam */
  * {
    color: #000 !important;
  }
  hr {
    border-top: 1px dashed #000 !important;
  }
}
</style>

