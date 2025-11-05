<template>
  <!-- 
    src/components/CartPanel.vue
    (REFACTOR) Menggunakan Chakra UI
  -->
  <CBox bg="white" rounded="xl" shadow="md" p="5">
    <CHeading as="h2" size="lg" mb="4">Keranjang</CHeading>

    <!-- Keranjang Kosong -->
    <CBox
      v-if="cart.length === 0"
      color="gray.400"
      text-align="center"
      py="10"
    >
      <CIcon name="shopping-cart" size="32px" mb="3" />
      <CText>Belum ada item 🛍</CText>
    </CBox>

    <!-- Daftar Item -->
    <CBox v-else max-h="60" overflow-y="auto" pr="2">
      <CFlex
        v-for="(item, i) in cart"
        :key="i"
        justify="space-between"
        align="center"
        mb="3"
      >
        <CBox>
          <CText font-weight="medium" no-of-lines="1" max-w="150px">{{ item.name }}</CText>
          <CText font-size="xs" color="gray.500">
            Rp {{ Number(item.price).toLocaleString('id-ID') }}
          </CText>
        </CBox>
        <CStack direction="row" align="center" spacing="2">
          <CButton size="xs" rounded="full" @click="$emit('decrease', i)">-</CButton>
          <CText font-weight="bold">{{ item.qty }}</CText>
          <CButton size="xs" rounded="full" @click="$emit('increase', i)">+</CButton>
          <CIconButton
            variant="ghost"
            color-scheme="red"
            size="xs"
            rounded="full"
            aria-label="Remove item"
            icon="close"
            @click="$emit('remove', i)"
          />
        </CStack>
      </CFlex>
    </CBox>

    <CDivider my="3" />

    <!-- Area Pelanggan -->
    <CBox mb="3">
      <CFormLabel font-size="sm" font-weight="medium" color="gray.700">Pelanggan</CFormLabel>
      <CBox
        v-if="selectedCustomer"
        mt="1"
        p="3"
        bg="green.50"
        rounded="lg"
      >
        <CFlex justify="space-between" align="center">
          <CBox>
            <CText font-weight="medium" color="green.800">{{ selectedCustomer.name }}</CText>
            <CText font-size="sm" color="green.700">{{ selectedCustomer.phone }}</CText>
          </CBox>
          <CButton variant="link" size="xs" color-scheme="red" @click="$emit('clear-customer')">
            Ganti
          </CButton>
        </CFlex>
        <CBox mt="2" pt="2" border-top="1px" border-color="green.200" d="flex" align-items="center" gap="2">
          <CTag size="sm" :color-scheme="levelBadge(selectedCustomer.member_level)">
            {{ selectedCustomer.member_level }}
          </CTag>
          <CText font-size="sm" color="blue.600" font-weight="medium">
            {{ Number(selectedCustomer.points).toLocaleString('id-ID') }} Poin
          </CText>
        </CBox>
      </CBox>
      <CButton
        v-else
        variant="outline"
        w="full"
        mt="1"
        py="3"
        border-style="dashed"
        @click="$emit('select-customer-click')"
      >
        + Pilih / Tambah Pelanggan
      </CButton>
    </CBox>

    <!-- Area Metode Bayar -->
    <CBox mb="3">
      <CFormLabel font-size="sm" font-weight="medium" color="gray.700">Metode Bayar</CFormLabel>
      <CWrap spacing="2" mt="1">
        <CButton
          v-for="method in paymentMethods"
          :key="method.id"
          @click="$emit('payment-change', method.id)"
          size="sm"
          :variant="paymentMethod === method.id ? 'solid' : 'outline'"
          :color-scheme="paymentMethod === method.id ? 'green' : 'gray'"
        >
          {{ method.name }}
        </CButton>
      </CWrap>
    </CBox>

    <CDivider my="3" />

    <!-- Area Redeem Poin -->
    <CBox mb="3" v-if="selectedCustomer && selectedCustomer.points > 0">
      <CFormLabel font-size="sm" font-weight="medium" color="gray.700">Redeem Poin</CFormLabel>
      <CInputGroup size="md" mt="1">
        <CInput
          :model-value="pointsToRedeem"
          @update:model-value="$emit('update:pointsToRedeem', parseInt($event) || 0)"
          type="number"
          min="0"
          :max="selectedCustomer.points"
          placeholder="0 Poin"
          rounded-right="0"
        />
        <CInputRightElement w="auto">
          <CButton
            size="md"
            h="full"
            color-scheme="blue"
            variant="outline"
            rounded-left="0"
            @click="$emit('apply-max-points')"
          >
            Max
          </CButton>
        </CInputRightElement>
      </CInputGroup>
      <CText v-if="pointsToRedeem > 0" font-size="sm" color="gray.600" mt="1">
        Menggunakan {{ pointsToRedeem }} Poin = Potongan Rp {{ pointsRedeemedValue.toLocaleString('id-ID') }}
      </CText>
    </CBox>

    <!-- Rincian Total -->
    <CStack spacing="2" font-size="sm" mb="4">
      <CFlex justify="space-between">
        <CText color="gray.600">Subtotal:</CText>
        <CText font-weight="medium">Rp {{ subtotal.toLocaleString('id-ID') }}</CText>
      </CFlex>
      <CFlex v-if="discount.amount > 0" justify="space-between">
        <CText color="gray.600">Diskon ({{ discount.rate * 100 }}%):</CText>
        <CText font-weight="medium" color="green.600">
          - Rp {{ discount.amount.toLocaleString('id-ID') }}
        </CText>
      </CFlex>
      <CFlex v-if="pointsRedeemedValue > 0" justify="space-between">
        <CText color="gray.600">Redeem Poin:</CText>
        <CText font-weight="medium" color="green.600">
          - Rp {{ pointsRedeemedValue.toLocaleString('id-ID') }}
        </CText>
      </CFlex>
      <CDivider pt="2" />
      <CFlex justify="space-between" font-weight="bold" font-size="lg">
        <CText>Total Akhir:</CText>
        <CText>Rp {{ finalTotal.toLocaleString('id-ID') }}</CText>
      </CFlex>
    </CStack>

    <!-- Tombol Bayar -->
    <CButton
      color-scheme="green"
      size="lg"
      font-size="lg"
      w="full"
      py="6"
      :is-loading="loading"
      :disabled="cart.length === 0"
      @click="$emit('checkout')"
    >
      {{ loading ? 'Memproses...' : 'Bayar Sekarang' }}
    </CButton>
  </CBox>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
export default {
  props: {
    cart: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    subtotal: { type: Number, default: 0 },
    discount: { type: Object, default: () => ({ rate: 0, amount: 0 }) },
    pointsRedeemedValue: { type: Number, default: 0 },
    finalTotal: { type: Number, default: 0 },
    selectedCustomer: { type: Object, default: null },
    paymentMethod: { type: String, default: 'cash' },
    paymentMethods: { type: Array, default: () => [] },
    pointsToRedeem: { type: Number, default: 0 }
  },
  emits: [
    'increase', 'decrease', 'remove', 'checkout',
    'select-customer-click', 'clear-customer', 'payment-change',
    'update:pointsToRedeem', 'apply-max-points'
  ],
  setup() {
    const levelBadge = (level) => {
      switch (level) {
        case 'standard': return 'gray'
        case 'gold': return 'yellow'
        case 'platinum': return 'purple'
        default: return 'gray'
      }
    }
    return { levelBadge }
  }
}
</script>