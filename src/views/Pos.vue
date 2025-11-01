<!-- eslint-disable vue/multi-word-component-names -->
<!-- 
  src/views/Pos.vue
  Otak utama aplikasi kasir (Fase 5.A)
-->
<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-green-700">☕ TemuPOS</h1>
      <div>
        <router-link 
          v-if="userRole === 'admin'"
          to="/admin" 
          class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 mr-4 font-medium"
        >
          Ke Admin CMS
        </router-link>
        <button @click="handleLogout" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium">
          Logout ({{ userEmail }})
        </button>
      </div>
    </div>

    <!-- Layout Utama -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Kolom Kiri: Produk -->
      <div class="lg:col-span-2">
        <ProductGrid 
          :products="products"
          :loading="loadingProducts"
          @add="addToCart"
        />
      </div>

      <!-- Kolom Kanan: Keranjang -->
      <div class="lg:col-span-1">
        <CartPanel
          :cart="cart"
          :total="total"
          :loading="loadingCheckout"
          :selectedCustomer="selectedCustomer"
          :paymentMethod="paymentMethod"
          :paymentMethods="paymentMethods"
          @increase="increaseQty"
          @decrease="decreaseQty"
          @remove="removeItem"
          @select-customer-click="showCustomerModal = true"
          @clear-customer="selectedCustomer = null"
          @payment-change="(method) => paymentMethod = method"
          @checkout="handleCheckout"
        />
      </div>

    </div>

    <!-- Modal Pelanggan (dari Fase 3) -->
    <CustomerModal
      :show="showCustomerModal"
      @close="showCustomerModal = false"
      @customer-selected="(customer) => selectedCustomer = customer"
    />

    <!-- Modal Sukses Transaksi (dari Fase 5.A) -->
    <SuccessModal
      :show="showSuccessModal"
      :transaction="lastTransactionDetails"
      @close="resetForNewTransaction"
    />

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabaseClient'
import { useRouter } from 'vue-router'
import ProductGrid from '../components/ProductGrid.vue'
import CartPanel from '../components/CartPanel.vue'
import CustomerModal from '../components/CustomerModal.vue'
import SuccessModal from '../components/SuccessModal.vue'

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
    
    // === State Pelanggan & Bayar ===
    const selectedCustomer = ref(null)
    const paymentMethod = ref('cash')
    const paymentMethods = ref([
      { id: 'cash', name: 'Cash' },
      { id: 'qris', name: 'QRIS' },
      { id: 'debit', name: 'Debit' },
    ])
    
    // === State UI & Modal ===
    const showCustomerModal = ref(false)
    const showSuccessModal = ref(false)
    const lastTransactionDetails = ref(null)

    // === State Loading ===
    const loadingProducts = ref(true)
    const loadingCheckout = ref(false)

    // === OTENTIKASI ===
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        userEmail.value = session.user.email;
        // Ambil role dari 'profiles'
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) userRole.value = profile.role;
      }
    }
    const handleLogout = async () => {
      if (confirm('Anda yakin ingin logout?')) {
        await supabase.auth.signOut();
        router.push({ name: 'Login' });
      }
    }

    // === LOGIKA PRODUK ===
    const fetchProducts = async () => {
      loadingProducts.value = true;
      try {
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (error) throw error
        products.value = data;
      } catch (error) {
        alert('Gagal ambil produk: ' + error.message);
      } finally {
        loadingProducts.value = false;
      }
    }

    // === LOGIKA KERANJANG ===
    const total = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.qty), 0));
    
    const addToCart = (product) => {
      const existing = cart.value.find(item => item.product_id === product.id);
      if (existing) {
        existing.qty++;
      } else {
        cart.value.push({ 
          product_id: product.id, 
          name: product.name, 
          price: product.price, 
          qty: 1 
        });
      }
    };
    
    const increaseQty = (index) => { cart.value[index].qty++; };
    
    const decreaseQty = (index) => {
      if (cart.value[index].qty > 1) {
        cart.value[index].qty--;
      } else {
        cart.value.splice(index, 1);
      }
    };
    
    const removeItem = (index) => {
      cart.value.splice(index, 1);
    };

    // === LOGIKA CHECKOUT (Fase 5.A) ===
    const handleCheckout = async () => {
      if (cart.value.length === 0) return;
      
      if (!confirm(`Total: Rp ${total.value.toLocaleString('id-ID')}\nMetode Bayar: ${paymentMethod.value.toUpperCase()}\n\nLanjutkan?`)) {
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
        // 1. Panggil 'handle_checkout' (Fungsi SQL)
        const { data: newTransactionId, error: checkoutError } = await supabase.rpc('handle_checkout', {
          cart_items: cartDataForDB,
          total_amount: total.value,
          p_customer_id: customerId,
          p_payment_method: paymentMethod.value
        })
        if (checkoutError) throw checkoutError
        
        // 2. Ambil detail transaksi untuk struk
        const { data: details, error: detailsError } = await supabase.rpc('get_transaction_details', {
          p_transaction_id: newTransactionId
        })
        if (detailsError) throw detailsError
        
        // 3. Simpan detail dan tampilkan modal sukses
        lastTransactionDetails.value = details
        showSuccessModal.value = true
        
        // 4. Reset keranjang
        cart.value = []

      } catch (error) {
        alert('Transaksi GAGAL: ' + error.message)
      } finally {
        loadingCheckout.value = false
      }
    }
    
    // Dipanggil saat modal sukses ditutup
    const resetForNewTransaction = () => {
      showSuccessModal.value = false
      lastTransactionDetails.value = null
      selectedCustomer.value = null
      paymentMethod.value = 'cash'
    }

    // === LIFECYCLE HOOKS ===
    onMounted(() => {
      getCurrentUser()
      fetchProducts()
    })

    return {
      products, cart, userEmail, userRole,
      loadingProducts, loadingCheckout,
      total,
      handleLogout, addToCart, increaseQty, decreaseQty, removeItem,
      handleCheckout,
      selectedCustomer, paymentMethod, paymentMethods,
      showCustomerModal,
      showSuccessModal,
      lastTransactionDetails,
      resetForNewTransaction
    }
  }
}
</script>

