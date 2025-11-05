<template>
  <CBox p="6">
    <CHeading size="lg" mb="6">📊 Laporan Transaksi</CHeading>

    <!-- Loading Skeleton -->
    <CSimpleGrid v-if="loading" columns="3" spacing="4">
      <CBox v-for="n in 6" :key="n" p="4" bg="white" shadow="md" rounded="xl">
        <CSkeleton height="20px" mb="2" />
        <CSkeleton height="16px" />
      </CBox>
    </CSimpleGrid>

    <!-- Pesan Jika Kosong -->
    <CAlert v-else-if="!loading && transactions.length === 0" status="info" rounded="lg" mb="4">
      <CAlertIcon />
      <CBox>
        <CAlertTitle>Tidak ada transaksi.</CAlertTitle>
        <CAlertDescription>
          Belum ada data transaksi dalam periode ini.
        </CAlertDescription>
      </CBox>
    </CAlert>

    <!-- Tabel Transaksi -->
    <CTable v-else variant="simple" colorScheme="gray">
      <CTableCaption>Laporan 100 transaksi terakhir</CTableCaption>
      <CTableThead bg="gray.50">
        <CTableRow>
          <CTableHeader>No</CTableHeader>
          <CTableHeader>Nama Pelanggan</CTableHeader>
          <CTableHeader>Metode Pembayaran</CTableHeader>
          <CTableHeader isNumeric>Total</CTableHeader>
          <CTableHeader isNumeric>Diskon</CTableHeader>
          <CTableHeader>Tanggal</CTableHeader>
        </CTableRow>
      </CTableThead>

      <CTableTbody>
        <CTableRow v-for="(tx, i) in transactions" :key="tx.id">
          <CTableCell>{{ i + 1 }}</CTableCell>
          <CTableCell>
            <CText fontWeight="medium">{{ tx.customers?.name || 'Umum' }}</CText>
            <CText fontSize="sm" color="gray.500">{{ tx.customers?.phone }}</CText>
          </CTableCell>
          <CTableCell>
            <CBadge :colorScheme="paymentBadge(tx.payment_method)">
              {{ tx.payment_method || 'Lainnya' }}
            </CBadge>
          </CTableCell>
          <CTableCell isNumeric>
            Rp {{ Number(tx.final_amount).toLocaleString('id-ID') }}
          </CTableCell>
          <CTableCell isNumeric color="red.500">
            - Rp {{ Number(tx.discount_amount + tx.points_value_redeemed || 0).toLocaleString('id-ID') }}
          </CTableCell>
          <CTableCell>
            <CText>{{ new Date(tx.created_at).toLocaleString('id-ID') }}</CText>
          </CTableCell>
        </CTableRow>
      </CTableTbody>

      <CTableFooter bg="gray.50">
        <CTableRow>
          <CTableCell colSpan="3" textAlign="right" fontWeight="bold">Total:</CTableCell>
          <CTableCell isNumeric fontWeight="bold">
            Rp {{ totalRevenue.toLocaleString('id-ID') }}
          </CTableCell>
          <CTableCell isNumeric color="red.600" fontWeight="bold">
            - Rp {{ totalDiscounts.toLocaleString('id-ID') }}
          </CTableCell>
          <CTableCell></CTableCell>
        </CTableRow>
      </CTableFooter>
    </CTable>
  </CBox>
</template>

<script setup>
import {
  CBox, CHeading, CSimpleGrid, CSkeleton,
  CAlert, CAlertIcon, CAlertTitle, CAlertDescription,
  CTable, CTableCaption, CTableThead, CTableRow, CTableHeader,
  CTableTbody, CTableCell, CTableFooter, CBadge, CText
} from '@chakra-ui/vue-next'
import { ref, onMounted, computed } from 'vue'
import { useToast } from '@chakra-ui/vue-next'
import { supabase } from '../../supabaseClient'

const toast = useToast()
const transactions = ref([])
const loading = ref(true)

const fetchTransactions = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, customers(name, phone)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    transactions.value = data || []
  } catch (error) {
    toast({
      title: 'Gagal memuat laporan',
      description: error.message,
      status: 'error',
      duration: 4000,
      isClosable: true
    })
  } finally {
    loading.value = false
  }
}

const totalRevenue = computed(() =>
  transactions.value.reduce((sum, tx) => sum + Number(tx.final_amount || 0), 0)
)

const totalDiscounts = computed(() =>
  transactions.value.reduce((sum, tx) =>
    sum + Number(tx.discount_amount || 0) + Number(tx.points_value_redeemed || 0), 0)
)

const paymentBadge = (method) => {
  const colors = {
    cash: 'green',
    qris: 'blue',
    debit: 'purple'
  }
  return colors[method?.toLowerCase()] || 'gray'
}

onMounted(fetchTransactions)
</script>
