<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Laporan Penjualan</h1>

    <!-- Stat Card -->
     <template>
  <h1>Reports Page</h1>
</template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-sm font-medium text-gray-500">Total Omset</h3>
        <p v-if="loading" class="text-2xl font-bold">...</p>
        <p v-else class="text-3xl font-bold text-green-700">
          Rp {{ totalRevenue.toLocaleString('id-ID') }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-sm font-medium text-gray-500">Total Transaksi</h3>
        <p v-if="loading" class="text-2xl font-bold">...</p>
        <p v-else class="text-3xl font-bold text-gray-900">
          {{ transactions.length }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-sm font-medium text-gray-500">Rata-rata / Transaksi</h3>
        <p v-if="loading" class="text-2xl font-bold">...</p>
        <p v-else class="text-3xl font-bold text-gray-900">
          Rp {{ avgPerTx.toLocaleString('id-ID', {minimumFractionDigits: 0, maximumFractionDigits: 0}) }}
        </p>
      </div>
    </div>

    <!-- Tabel Transaksi -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <h3 class="text-lg font-bold p-4 border-b">Riwayat Transaksi Terakhir</h3>
      
      <div v-if="loading" class="p-6 text-center text-gray-500">
        Memuat data transaksi...
      </div>
      
      <div v-else-if="transactions.length === 0" class="p-6 text-center text-gray-500">
        Belum ada transaksi yang tercatat.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode Bayar</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tx in transactions" :key="tx.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">#{{ tx.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ new Date(tx.created_at).toLocaleString('id-ID') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                <div v-if="tx.customers">
                  <p class="font-medium">{{ tx.customers.name }}</p>
                  <p class="text-xs text-gray-500">{{ tx.customers.phone }}</p>
                </div>
                <span v-else class="text-gray-400 italic">Walk-in</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', paymentBadge(tx.payment_method)]">
                  {{ tx.payment_method.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                Rp {{ Number(tx.total_amount).toLocaleString('id-ID') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../supabaseClient'

export default {
  setup() {
    const transactions = ref([])
    const loading = ref(true)

    const fetchTransactions = async () => {
      loading.value = true
      try {
        // Kueri JOIN: Ambil data dari 'transactions'
        // DAN 'join' data dari tabel 'customers'
        const { data, error } = await supabase
          .from('transactions')
          .select('*, customers ( name, phone )') // Ambil kolom 'name' & 'phone' dari tabel 'customers'
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
      return transactions.value.reduce((sum, tx) => sum + Number(tx.total_amount), 0)
    })
    
    const avgPerTx = computed(() => {
      if (transactions.value.length === 0) return 0
      return totalRevenue.value / transactions.value.length
    })

    const paymentBadge = (method) => {
      switch (method) {
        case 'cash': return 'bg-green-100 text-green-800'
        case 'qris': return 'bg-blue-100 text-blue-800'
        case 'debit': return 'bg-purple-100 text-purple-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    onMounted(() => {
      fetchTransactions()
    })

    return {
      transactions,
      loading,
      totalRevenue,
      avgPerTx,
      paymentBadge
    }
  }
}
</script>

