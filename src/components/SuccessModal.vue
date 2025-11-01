<!-- 
  src/components/SuccessModal.vue
  (UPDATE) Tampilkan Final Amount & perbarui template WA
-->
<template>
  <div 
    v-if="show && transaction" 
    class="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
  >
    <div class="bg-white w-full max-w-md rounded-xl shadow-xl p-6 text-center">
      <h2 class="text-3xl font-bold text-green-600 mb-3">Transaksi Berhasil!</h2>
      
      <p class="text-gray-600">
        Transaksi <span class="font-medium">#{{ transaction.id }}</span> 
        senilai <span class="font-medium">Rp {{ Number(transaction.final_amount).toLocaleString('id-ID') }}</span> 
        telah disimpan.
      </p>
      
      <!-- (BARU) Tampilkan info poin -->
      <div v-if="transaction.customer" class="mt-4 p-3 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-700">Poin Pelanggan ({{ transaction.customer.name }}):</p>
        <p class="text-2xl font-bold text-blue-800">
          {{ Number(transaction.customer.points).toLocaleString('id-ID') }} Poin
        </p>
      </div>
      
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- 1. Tombol Print -->
        <button
          @click="handlePrint"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          🖨️ Cetak Struk
        </button>

        <!-- 2. Tombol Kirim WA -->
        <button
          @click="handleWhatsApp"
          :disabled="!hasCustomerPhone"
          class="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="hasCustomerPhone">Kirim via WhatsApp</span>
          <span v-else>Kirim via WhatsApp (No. HP tidak ada)</span>
        </button>
      </div>

      <!-- 3. Tombol Tutup -->
      <button 
        @click="$emit('close')"
        class="w-full mt-4 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
      >
        Tutup (Transaksi Baru)
      </button>

    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  props: {
    show: Boolean,
    transaction: Object // Objek detail transaksi dari fungsi SQL v3
  },
  emits: ['close'],
  
  setup(props) {
    const router = useRouter()

    const hasCustomerPhone = computed(() => {
      return props.transaction?.customer?.phone
    })

    // (UPDATE) Perbarui generator teks WA
    const generateReceiptText = () => {
      if (!props.transaction) return ''
      const tx = props.transaction
      
      let text = `*-- NOTA TRANSAKSI --*\n`
      text += `TemuPOS\n`
      text += `ID: #${tx.id}\n`
      text += `Tgl: ${new Date(tx.created_at).toLocaleString('id-ID')}\n`
      if (tx.customer) {
        text += `Pelanggan: ${tx.customer.name}\n`
      }
      text += `----------------------\n`
      
      tx.items.forEach(item => {
        text += `${item.name}\n`
        text += `  ${item.qty} x ${Number(item.price).toLocaleString('id-ID')} = ${Number(item.subtotal).toLocaleString('id-ID')}\n`
      })
      
      text += `----------------------\n`
      text += `Subtotal: Rp ${Number(tx.subtotal).toLocaleString('id-ID')}\n`
      
      if (tx.discount_amount > 0) {
        text += `Diskon: -Rp ${Number(tx.discount_amount).toLocaleString('id-ID')}\n`
      }
      if (tx.points_value_redeemed > 0) {
        text += `Redeem Poin: -Rp ${Number(tx.points_value_redeemed).toLocaleString('id-ID')}\n`
      }
      
      text += `*TOTAL AKHIR: Rp ${Number(tx.final_amount).toLocaleString('id-ID')}*\n`
      text += `Bayar: ${tx.payment_method.toUpperCase()}\n\n`
      
      if (tx.customer) {
        text += `Poin Anda sekarang: ${Number(tx.customer.points).toLocaleString('id-ID')} Poin\n\n`
      }
      
      text += `Terima kasih!`
      
      return text
    }

    const handlePrint = () => {
      const url = router.resolve({ 
        name: 'PrintReceipt', 
        params: { id: props.transaction.id } 
      }).href
      window.open(url, '_blank', 'width=350,height=600,scrollbars=yes,resizable=yes')
    }

    const handleWhatsApp = () => {
      if (!hasCustomerPhone.value) return
      
      const phone = props.transaction.customer.phone
      let formattedPhone = phone.startsWith('0') 
        ? '62' + phone.substring(1) 
        : phone
      
      const message = generateReceiptText()
      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      
      window.open(waUrl, '_blank')
    }

    return {
      hasCustomerPhone,
      handlePrint,
      handleWhatsApp
    }
  }
}
</script>

