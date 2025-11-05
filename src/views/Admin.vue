<template>
  <!-- 
    src/views/Admin.vue
    (REFACTOR) Menggunakan Chakra UI <CFlex> & <CBox>
  -->
  <CFlex min-h="100vh" bg="gray.100">
    <!-- Sidebar Navigasi -->
    <CBox
      w="256px"
      bg="gray.800"
      color="white"
      d="flex"
      flex-direction="column"
      shadow="lg"
      position="fixed"
      h="full"
    >
      <CBox p="6">
        <CHeading as="h1" size="lg" color="yellow.400">🔑 CMS TemuPOS</CHeading>
        <CText font-size="sm" color="gray.400">Admin Dashboard</CText>
      </CBox>
      
      <CStack as="nav" flex="1" p="4" spacing="2">
        <!-- Link Navigasi -->
        <CButton
          as="router-link"
          to="/admin/reports"
          variant="ghost"
          justify-content="start"
          left-icon="chart-bar"
          color-scheme="whiteAlpha"
          _active-link="{ bg: 'whiteAlpha.200', color: 'yellow.400' }"
        >
          Laporan
        </CButton>
        
        <CButton
          as="router-link"
          to="/admin/products"
          variant="ghost"
          justify-content="start"
          left-icon="box"
          color-scheme="whiteAlpha"
          _active-link="{ bg: 'whiteAlpha.200', color: 'yellow.400' }"
        >
          Produk
        </CButton>

        <CButton
          as="router-link"
          to="/admin/customers"
          variant="ghost"
          justify-content="start"
          left-icon="users"
          color-scheme="whiteAlpha"
          _active-link="{ bg: 'whiteAlpha.200', color: 'yellow.400' }"
        >
          Pelanggan
        </CButton>
        
        <CButton
          as="router-link"
          to="/admin/settings"
          variant="ghost"
          justify-content="start"
          left-icon="cog"
          color-scheme="whiteAlpha"
          _active-link="{ bg: 'whiteAlpha.200', color: 'yellow.400' }"
        >
          Pengaturan
        </CButton>
      </CStack>

      <!-- Footer Sidebar -->
      <CStack p="4" border-top="1px" border-color="gray.700" spacing="3">
        <CButton
          as="router-link"
          to="/pos"
          color-scheme="green"
        >
          Kembali ke POS
        </CButton>
        <CButton
          color-scheme="red"
          variant="outline"
          @click="handleLogout"
        >
          Logout
        </CButton>
      </CStack>
    </CBox>
    
    <!-- Area Konten Utama -->
    <CBox flex="1" ml="256px" p="8" overflow-y="auto">
      <!-- 
        Di sinilah <router-view> akan merender 
        komponen anak (Reports, Products, dll)
      -->
      <router-view />
    </CBox>
  </CFlex>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
import { supabase } from '../supabaseClient'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    const handleLogout = async () => {
      if (confirm('Anda yakin ingin logout dari CMS?')) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          alert('Gagal logout: ' + error.message)
        } else {
          router.push({ name: 'Landing' })
        }
      }
    }

    return {
      handleLogout
    }
  }
}
</script>