<template>
  <!-- 
    src/views/Pos.vue
    (REFACTOR) Menggunakan Chakra UI <CGrid>
  -->
  <CBox bg="gray.100" min-h="100vh" p="8">
    <!-- Header -->
    <CFlex justify="space-between" align="center" mb="6">
      <CBox d="flex" align-items="center">
        <CIcon name="coffee" size="32px" color="green.600" />
        <CHeading as="h1" size="lg" ml="3" font-weight="bold" color="green.700">
          TemuPOS
        </CHeading>
      </CBox>
      <CStack direction="row" spacing="4">
        <CButton
          v-if="userRole === 'admin'"
          as="router-link"
          to="/admin"
          color-scheme="yellow"
          shadow="md"
        >
          Ke Admin CMS
        </CButton>
        <CButton
          @click="handleLogout"
          color-scheme="red"
          shadow="md"
        >
          Logout ({{ userEmail }})
        </CButton>
      </CStack>
    </CFlex>

    <!-- Layout Utama Kasir -->
    <CGrid
      template-columns="repeat(3, 1fr)"
      gap="8"
    >
      <!-- Kolom Kiri: Produk -->
      <CGridItem col-span="2">
        <ProductGrid
          :products="products"
          :loading="loadingProducts"
          @add="addToCart"
        />
      </CGridItem>

      <!-- Kolom Kanan: Keranjang (Sticky) -->
      <CGridItem col-span="1" position="relative">
        <CBox position="sticky" top="8">
          <CartPanel
            :cart="cart"
            :loading="loadingCheckout"
            
            :subtotal="subtotal"
            :discount="discount"
            :pointsRedeemedValue="pointsRedeemedValue"
            :finalTotal="finalTotal"
            
            :selectedCustomer="selectedCustomer"
            :paymentMethod="paymentMethod"
            :paymentMethods="paymentMethods"
            
            v-model:pointsToRedeem="pointsToRedeem"
            @apply-max-points="applyMaxPoints"
            
            @increase="increaseQty"
            @decrease="decreaseQty"
            @remove="removeItem"
            @select-customer-click="showCustomerModal = true"
            @clear-customer="clearCustomer"
            @payment-change="(method) => paymentMethod = method"
            @checkout="handleCheckout"
          />
        </CBox>
      </CGridItem>
    </CGrid>

    <!-- Modal-modal (sekarang dikontrol dari sini) -->
    
    <!-- Modal Pelanggan -->
    <CustomerModal
      :show="showCustomerModal"
      @close="showCustomerModal = false"
      @customer-selected="selectCustomer"
    />

    <!-- Modal Sukses -->
    <SuccessModal
      :show="showSuccessModal"
      :transaction="lastTransactionDetails"
      @close="resetForNewTransaction"
    />

  </CBox>
</template>

<script>
// (SEMUA KODE <script> SAMA PERSIS DENGAN FASE 6)
// (Tidak perlu diubah, hanya template-nya)
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabaseClient'
import { useRouter } from 'vue-router'
import ProductGrid from '../components/ProductGrid.vue'
import CartPanel from '../components/CartPanel.vue'
import CustomerModal from '../components/CustomerModal.vue'
import SuccessModal from '../components/SuccessModal.vue'

// Konfigurasi Bisnis
const MEMBER_DISCOUNT_RATE = {
  'standard': 0,
  'gold': 0.05,       // Diskon 5%
  'platinum': 0.10    // Diskon 10%
}
const POINT_TO_RUPIAH_RATE = 100 // 1 Poin = Rp 100

export default {
  components: {
    ProductGrid,
    CartPanel,
    CustomerModal,
    SuccessModal
  },
  setup() {
    const router = useRouter()
    
    // === State Data ===
    const products = ref([])
    const cart = ref([])
    const userEmail = ref('')
    const userRole = ref('kasir')
    
    // === State Transaksi ===
    const selectedCustomer = ref(null)
    const paymentMethod = ref('cash')
    const paymentMethods = ref([
      { id: 'cash', name: 'Cash' },
      { id: 'qris', name: 'QRIS' },
      { id: 'debit', name: 'Debit' },
    ])
    const pointsToRedeem = ref(0)

    // === State UI & Loading ===
    const showCustomerModal = ref(false)
    const showSuccessModal = ref(false)
    const lastTransactionDetails = ref(null)
    const loadingProducts = ref(true)
    const loadingCheckout = ref(false)

    // === OTENTIKASI ===
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        userEmail.value = session.user.email;
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) userRole.value = profile.role;
      } else {
        router.push({ name: 'Login' }) // Ke login jika tidak ada sesi
      }
    }
    const handleLogout = async () => {
      if (confirm('Anda yakin ingin logout?')) {
        await supabase.auth.signOut();
        router.push({ name: 'Landing' }); // Kembali ke landing page
      }
    }

    // === LOGIKA PRODUK ===
    const fetchProducts = async () => {
      loadingProducts.value = true;
      try {
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (error) throw error;
        products.value = data;
      } catch (error) {
        alert('Gagal ambil produk: ' + error.message);
      } finally {
        loadingProducts.value = false;
      }
    }

    // === LOGIKA KERANJANG ===
    const addToCart = (product) => {
      const existing = cart.value.find(item => item.product_id === product.id);
      if (existing) existing.qty++;
      else cart.value.push({ product_id: product.id, name: product.name, price: product.price, qty: 1 });
    };
    const increaseQty = (index) => { cart.value[index].qty++; };
    const decreaseQty = (index) => {
      if (cart.value[index].qty > 1) cart.value[index].qty--;
      else cart.value.splice(index, 1);
    };
    const removeItem = (index) => { cart.value.splice(index, 1); };

    // === LOGIKA KOMPUTASI ===
    const subtotal = computed(() => {
      return cart.value.reduce((sum, item) => sum + (item.price * item.qty), 0)
    })
    const discount = computed(() => {
      if (!selectedCustomer.value) return { rate: 0, amount: 0 }
      const level = selectedCustomer.value.member_level || 'standard'
      const rate = MEMBER_DISCOUNT_RATE[level] || 0
      const amount = Math.floor(subtotal.value * rate)
      return { rate, amount }
    })
    const pointsRedeemedValue = computed(() => {
      if (!selectedCustomer.value || pointsToRedeem.value <= 0) {
        return 0
      }
      const validPoints = Math.min(selectedCustomer.value.points, pointsToRedeem.value)
      return validPoints * POINT_TO_RUPIAH_RATE
    })
    const finalTotal = computed(() => {
      let total = subtotal.value
      total -= discount.value.amount
      total -= pointsRedeemedValue.value
      return Math.max(0, total)
    })
    
    // === FUNGSI ===
    const applyMaxPoints = () => {
      if (!selectedCustomer.value) return;
      const afterDiscountTotal = subtotal.value - discount.value.amount
      if (afterDiscountTotal <= 0) {
        pointsToRedeem.value = 0
        return
      }
      const pointsNeeded = Math.ceil(afterDiscountTotal / POINT_TO_RUPIAH_RATE)
      const pointsToUse = Math.min(selectedCustomer.value.points, pointsNeeded)
      pointsToRedeem.value = pointsToUse
    }
    const selectCustomer = (customer) => {
      selectedCustomer.value = customer
      pointsToRedeem.value = 0
    }
    const clearCustomer = () => {
      selectedCustomer.value = null
      pointsToRedeem.value = 0
    }

    // === LOGIKA CHECKOUT ===
    const handleCheckout = async () => {
      if (cart.value.length === 0) return;
      
      const customerName = selectedCustomer.value ? selectedCustomer.value.name : 'Walk-in'
      if (!confirm(
        `KONFIRMASI TRANSAKSI\n` +
        `Pelanggan: ${customerName}\n\n` +
        `Subtotal: Rp ${subtotal.value.toLocaleString('id-ID')}\n` +
        `Diskon: - Rp ${discount.value.amount.toLocaleString('id-ID')}\n` +
        `Redeem Poin: - Rp ${pointsRedeemedValue.value.toLocaleString('id-ID')}\n` +
        `--------------------\n` +
        `TOTAL AKHIR: Rp ${finalTotal.value.toLocaleString('id-ID')}\n` +
        `Metode Bayar: ${paymentMethod.value.toUpperCase()}\n\n` +
        `Lanjutkan?`
      )) {
        return;
      }
      
      loadingCheckout.value = true
      
      const cartDataForDB = cart.value.map(item => ({
        product_id: item.product_id,
        qty: item.qty,
        price: item.price
      }));
      const customerId = selectedCustomer.value ? selectedCustomer.value.id : null;

      try {
        const { data: newTransactionId, error: checkoutError } = await supabase.rpc('handle_checkout', {
          cart_items: cartDataForDB,
          p_subtotal: subtotal.value,
          p_customer_id: customerId,
          p_payment_method: paymentMethod.value,
          p_discount_amount: discount.value.amount,
          p_points_redeemed: pointsRedeemedValue.value > 0 ? pointsToRedeem.value : 0,
          p_points_value_redeemed: pointsRedeemedValue.value,
          p_final_amount: finalTotal.value
        })
        if (checkoutError) throw checkoutError
        
        const { data: details, error: detailsError } = await supabase.rpc('get_transaction_details', {
          p_transaction_id: newTransactionId
        })
        if (detailsError) throw detailsError
        
        lastTransactionDetails.value = details
        showSuccessModal.value = true
        cart.value = []

      } catch (error) {
        alert('Transaksi GAGAL: ' + error.message)
      } finally {
        loadingCheckout.value = false
      }
    }
    
    const resetForNewTransaction = () => {
      showSuccessModal.value = false
      lastTransactionDetails.value = null
      selectedCustomer.value = null
      paymentMethod.value = 'cash'
      pointsToRedeem.value = 0
    }

    onMounted(() => {
      getCurrentUser()
      fetchProducts()
    })

    return {
      products, cart, userEmail, userRole,
      loadingProducts, loadingCheckout,
      subtotal, discount, pointsRedeemedValue, finalTotal,
      handleLogout, addToCart, increaseQty, decreaseQty, removeItem,
      handleCheckout,
      selectedCustomer, paymentMethod, paymentMethods,
      showCustomerModal,
      pointsToRedeem,
      applyMaxPoints,
      selectCustomer,
      clearCustomer,
      showSuccessModal,
      lastTransactionDetails,
      resetForNewTransaction
    }
  }
}
</script>

