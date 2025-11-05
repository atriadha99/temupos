<template>
  <div class="p-4 max-w-xs mx-auto font-mono text-xs text-black" ref="receiptRoot" id="receipt-root">
    <div class="text-center mb-2">
      <img
        v-if="company?.logo_url"
        :src="company.logo_url"
        alt="logo"
        class="mx-auto mb-1 w-20 h-20 object-contain"
      />
      <div class="font-bold text-sm">{{ company?.name || 'Bisnis Kamu' }}</div>
      <div class="text-[10px] text-gray-700">{{ company?.tagline || '' }}</div>
      <div class="text-[10px] mt-1">{{ company?.address || '' }}</div>
    </div>

    <div class="border-t border-dashed my-2"></div>

    <div>
      <div class="flex justify-between">
        <div>ID</div>
        <div>#{{ tx.id }}</div>
      </div>
      <div class="flex justify-between">
        <div>Tgl</div>
        <div>{{ formattedDate }}</div>
      </div>
      <div class="flex justify-between">
        <div>Kasir</div>
        <div>{{ tx.cashier_name || '-' }}</div>
      </div>
      <div v-if="tx.customer" class="flex justify-between">
        <div>Pelanggan</div>
        <div>{{ tx.customer.name }}</div>
      </div>
    </div>

    <div class="border-t border-dashed my-2"></div>

    <div v-for="item in tx.items" :key="item.id" class="flex justify-between">
      <div class="w-2/3 truncate">{{ item.name }} x{{ item.qty }}</div>
      <div class="w-1/3 text-right">Rp {{ Number(item.subtotal).toLocaleString('id-ID') }}</div>
    </div>

    <div class="border-t border-dashed my-2"></div>

    <div class="flex justify-between">
      <div>Subtotal</div>
      <div>Rp {{ Number(tx.subtotal || 0).toLocaleString('id-ID') }}</div>
    </div>
    <div v-if="tx.discount_amount > 0" class="flex justify-between">
      <div>Diskon</div>
      <div>- Rp {{ Number(tx.discount_amount).toLocaleString('id-ID') }}</div>
    </div>
    <div v-if="tx.points_value_redeemed > 0" class="flex justify-between">
      <div>Redeem Poin</div>
      <div>- Rp {{ Number(tx.points_value_redeemed).toLocaleString('id-ID') }}</div>
    </div>

    <div class="mt-2 border-t pt-2 font-bold flex justify-between">
      <div>Total</div>
      <div>Rp {{ Number(tx.final_amount || 0).toLocaleString('id-ID') }}</div>
    </div>

    <div class="text-center mt-3 text-[11px]">
      {{ company?.tagline || '' }}<br />
      Terima kasih telah bertransaksi!
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/supabaseClient'
import { getCompanyProfile } from '@/utils/company'


export default {
  name: 'ReceiptPrint',
  setup() {

const company = ref(null)

onMounted(async () => {
  company.value = await getCompanyProfile()
})

    const route = useRoute()
    const id = route.params.id
    const tx = ref({
      id,
      items: [],
      subtotal: 0,
      final_amount: 0
    })
    const receiptRoot = ref(null)

    const formattedDate = computed(() => {
      return tx.value.created_at
        ? new Date(tx.value.created_at).toLocaleString('id-ID')
        : ''
    })

    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customer:customers(id,name,phone,points),
          items:transaction_items(id,product_id,name,qty,price,subtotal)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Fetch transaction error:', error)
        return
      }

      tx.value = data

      if (data.company_id) {
        const { data: companyData, error: companyErr } = await supabase
          .from('companies')
          .select('*')
          .eq('id', data.company_id)
          .single()

        if (!companyErr) company.value = companyData
      }
    }

    const doAutoPrint = () => {
      setTimeout(() => window.print(), 600)
    }

    onMounted(async () => {
      await fetchTransaction()
      doAutoPrint()
    })

    return {
      tx,
      company,
      formattedDate,
      receiptRoot
    }
  }
}
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #receipt-root,
  #receipt-root * {
    visibility: visible;
  }
  #receipt-root {
    position: absolute;
    left: 0;
    top: 0;
    width: 300px;
  }
}
</style>
