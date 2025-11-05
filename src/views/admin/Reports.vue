<template>
  <!-- 
    src/views/admin/Reports.vue
    (REFACTOR) Menggunakan Chakra UI <CGrid> & <CTable>
  -->
  <CBox>
    <CHeading as="h1" size="xl" mb="6">Laporan Penjualan</CHeading>

    <!-- Stat Card -->
    <CSimpleGrid columns="3" spacing="6" mb="6">
      <CBox bg="white" p="6" rounded="xl" shadow="md">
        <CHeading as="h3" size="sm" font-weight="medium" color="gray.500">
          Total Omset (Final)
        </CHeading>
        <CText v-if="loading" font-size="2xl" font-weight="bold">...</CText>
        <CText v-else font-size="3xl" font-weight="bold" color="green.700">
          Rp {{ totalRevenue.toLocaleString('id-ID') }}
        </CText>
      </CBox>
      <CBox bg="white" p="6" rounded="xl" shadow="md">
        <CHeading as="h3" size="sm" font-weight="medium" color="gray.500">
          Total Transaksi
        </CHeading>
        <CText v-if="loading" font-size="2xl" font-weight="bold">...</CText>
        <CText v-else font-size="3xl" font-weight="bold" color="gray.900">
          {{ transactions.length }}
        </CText>
      </CBox>
      <CBox bg="white" p="6" rounded="xl" shadow="md">
        <CHeading as="h3" size="sm" font-weight="medium" color="gray.500">
          Total Diskon Diberikan
        </CHeading>
        <CText v-if="loading" font-size="2xl" font-weight="bold">...</CText>
        <CText v-else font-size="3xl" font-weight="bold" color="red.600">
          - Rp {{ totalDiscounts.toLocaleString('id-ID') }}
        </CText>
      </CBox>
    </CSimpleGrid>

    <!-- Tabel Transaksi -->
    <CBox bg="white" rounded="xl" shadow="md" overflow="hidden">
      <CHeading as="h3" size="lg" p="5" border-bottom="1px" border-color="gray.100">
        Riwayat Transaksi Terakhir
      </CHeading>
      
      <CText v-if="loading" p="6" text-align="center" color="gray.500">
        Memuat data transaksi...
      </CText>
      
      <CText v-else-if="transactions.length === 0" p="6" text-align="center" color="gray.500">
        Belum ada transaksi yang tercatat.
      </CText>
      
      <CTableContainer v-else>
        <CTable variant="simple">
          <CThead bg="gray.50">
            <CTr>
              <CTh>Waktu</CTh>
              <CTh>Pelanggan</CTh>
              <CTh is-numeric>Subtotal</CTh>
              <CTh is-numeric>Diskon</CTh>
              <CTh is-numeric>Redeem</CTh>
              <CTh is-numeric>Total Akhir</CTh>
            </CTr>
          </CThead>
          <CTbody>
            <CTr v-for="tx in transactions" :key="tx.id">
              <CTd font-size="sm" color="gray.600">
                <CText font-weight="bold" color="gray.800">#{{ tx.id }}</CText>
                {{ new Date(tx.created_at).toLocaleString('id-ID') }}
                <br>
                <CTag size="sm" :color-scheme="paymentBadge(tx.payment_method)">
                  {{ tx.payment_method.toUpperCase() }}
                </CTag>
              </CTd>
              <CTd font-size="sm">
                <CBox v-if="tx.customers">
                  <CText font-weight="medium">{{ tx.customers.name }}</CText>
                  <CText color="gray.500">{{ tx.customers.phone }}</CText>
                </CBox>
                <CText v-else color="gray.400" font-style="italic">Walk-in</CText>
              </CTd>
              <CTd is-numeric font-size="sm" color="gray.600">
                Rp {{ Number(tx.total_amount).toLocaleString('id-ID') }}
              </CTd>
              <CTd is-numeric font-size="sm" color="red.600">
                -Rp {{ Number(tx.discount_amount).toLocaleString('id-ID') }}
              </CTd>
              <CTd is-numeric font-size="sm" color="red.600">
                -Rp {{ Number(tx.points_value_redeemed).toLocaleString('id-ID') }}
              </CTd>
              <CTd is-numeric font-size="sm" font-weight="bold" color="gray.900">
                Rp {{ Number(tx.final_amount).toLocaleString('id-ID') }}
              </CTd>
            </CTr>
          </CTbody>
        </CTable>
      </CTableContainer>
    </CBox>
  </CBox>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../supabaseClient'

export default {
  setup() {
    const transactions = ref([])
    const loading = ref(true)

    const fetchTransactions = async () => {
      loading.value = true
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(*, customers ( name, phone )) 
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        transactions.value = data

      } catch (error) {
        alert('Gagal mengambil laporan: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    const totalRevenue = computed(() => {
      return transactions.value.reduce((sum, tx) => sum + Number(tx.final_amount), 0)
    })
    
    const totalDiscounts = computed(() => {
      const discount = transactions.value.reduce((sum, tx) => sum + Number(tx.discount_amount), 0)
      const points = transactions.value.reduce((sum, tx) => sum + Number(tx.points_value_redeemed), 0)
      return discount + points
    })

    const paymentBadge = (method) => {
      switch (method) {
        case 'cash': return 'green'
        case 'qris': return 'blue'
        case 'debit': return 'purple'
        default: return 'gray'
      }
    }

    onMounted(() => {
      fetchTransactions()
    })

    return {
      transactions,
      loading,
      totalRevenue,
      totalDiscounts,
      paymentBadge
    }
  }
}
</script>