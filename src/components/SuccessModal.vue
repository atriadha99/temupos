<template>
  <!-- 
    src/components/SuccessModal.vue
    (REFACTOR) Menggunakan Chakra UI <CModal>
  -->
  <CModal :is-open="show" @close="$emit('close')" is-centered>
    <CModalOverlay />
    <CModalContent max-w="md">
      <CModalBody p="8">
        <CBox text-align="center">
          <CIcon name="check-circle" color="green.500" size="48px" mb="4" />
          <CHeading as="h2" size="lg" color="green.600" mb="3">
            Transaksi Berhasil!
          </CHeading>
          
          <CText v-if="transaction" color="gray.600">
            Transaksi <CBox as="span" font-weight="bold">#{{ transaction.id }}</CBox> 
            senilai <CBox as="span" font-weight="bold">Rp {{ Number(transaction.final_amount).toLocaleString('id-ID') }}</CBox> 
            telah disimpan.
          </CText>
          
          <CBox v-if="transaction?.customer" mt="4" p="3" bg="blue.50" rounded="lg">
            <CText font-size="sm" color="blue.700">Poin Pelanggan ({{ transaction.customer.name }}):</CText>
            <CText font-size="2xl" font-weight="bold" color="blue.800">
              {{ Number(transaction.customer.points).toLocaleString('id-ID') }} Poin
            </CText>
          </CBox>

          <CStack spacing="3" mt="6">
            <CButton
              color-scheme="blue"
              size="lg"
              left-icon="print"
              @click="handlePrint"
            >
              Cetak Struk
            </CButton>
            <CButton
              color-scheme="whatsapp"
              size="lg"
              left-icon="chat"
              :is-disabled="!hasCustomerPhone"
              @click="handleWhatsApp"
            >
              Kirim via WhatsApp
            </CButton>
            <CButton
              variant="outline"
              size="lg"
              mt="2"
              @click="$emit('close')"
            >
              Tutup (Transaksi Baru)
            </CButton>
          </CStack>
        </CBox>
      </CModalBody>
    </CModalContent>
  </CModal>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  props: {
    show: Boolean,
    transaction: Object
  },
  emits: ['close'],
  
  setup(props, { emit }) {
    const router = useRouter()

    const hasCustomerPhone = computed(() => {
      return props.transaction?.customer?.phone
    })

    const generateReceiptText = () => {
      if (!props.transaction) return ''
      const tx = props.transaction
      
      let text = *-- NOTA TRANSAKSI --*\n
      text += TemuPOS\n
      text += ID: #${tx.id}\n
      text += Tgl: ${new Date(tx.created_at).toLocaleString('id-ID')}\n
      if (tx.customer) {
        text += Pelanggan: ${tx.customer.name}\n
      }
      text += ----------------------\n
      
      tx.items.forEach(item => {
        text += ${item.name}\n
        text += `  ${item.qty} x ${Number(item.price).toLocaleString('id-ID')} = ${Number(item.subtotal).toLocaleString('id-ID')}\n`
      })
      
      text += ----------------------\n
      text += Subtotal: Rp ${Number(tx.subtotal).toLocaleString('id-ID')}\n
      
      if (tx.discount_amount > 0) {
        text += Diskon: -Rp ${Number(tx.discount_amount).toLocaleString('id-ID')}\n
      }
      if (tx.points_value_redeemed > 0) {
        text += Redeem Poin: -Rp ${Number(tx.points_value_redeemed).toLocaleString('id-ID')}\n
      }
      
      text += *TOTAL AKHIR: Rp ${Number(tx.final_amount).toLocaleString('id-ID')}*\n
      text += Bayar: ${tx.payment_method.toUpperCase()}\n\n
      
      if (tx.customer) {
        text += Poin Anda sekarang: ${Number(tx.customer.points).toLocaleString('id-ID')} Poin\n\n
      }
      
      text += Terima kasih!
      
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
      const waUrl = https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}
      
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