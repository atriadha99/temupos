<!-- 
  src/views/Landing.vue
  (BARU) Halaman Landing Page publik untuk TemuPOS
-->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center">
          <span class="text-4xl">☕</span>
          <h1 class="text-3xl font-bold text-gray-800 ml-2">TemuPOS</h1>
        </div>
        
        <!-- Navigasi -->
        <div class="flex items-center gap-4">
          <router-link to="/login" class="text-gray-600 hover:text-green-700 font-medium">
            Login
          </router-link>
          <router-link 
            to="/pos" 
            class="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            Mulai (Masuk App)
          </router-link>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <main class="container mx-auto px-6 py-24 text-center">
      <h2 class="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
        Sistem POS All-in-One<br />untuk Bisnis Anda
      </h2>
      <p class="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
        Dari F&B, Laundry, hingga Retail, TemuPOS adalah solusi kasir modern, terintegrasi, dan siap pakai untuk mengelola semua transaksi Anda.
      </p>
      <router-link 
        to="/pos" 
        class="bg-green-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg"
      >
        Mulai Gunakan Sekarang
      </router-link>
    </main>

    <!-- Fitur Section -->
    <section class="bg-white py-20">
      <div class="container mx-auto px-6">
        <h3 class="text-3xl font-bold text-center mb-12">Fitur Unggulan</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <!-- Fitur 1 -->
          <div class="text-center p-6 bg-gray-50 rounded-xl shadow">
            <span class="text-5xl">🛒</span>
            <h4 class="text-xl font-bold my-3">Manajemen Kasir</h4>
            <p class="text-gray-600">Antarmuka kasir yang cepat, modern, dan terintegrasi dengan manajemen pelanggan.</p>
          </div>
          <!-- Fitur 2 -->
          <div class="text-center p-6 bg-gray-50 rounded-xl shadow">
            <span class="text-5xl">👥</span>
            <h4 class="text-xl font-bold my-3">Loyalitas Pelanggan</h4>
            <p class="text-gray-600">Sistem poin dan level *membership* (Gold, Platinum) untuk menjaga loyalitas pelanggan Anda.</p>
          </div>
          <!-- Fitur 3 -->
          <div class="text-center p-6 bg-gray-50 rounded-xl shadow">
            <span class="text-5xl">📊</span>
            <h4 class="text-xl font-bold my-3">Admin CMS & Laporan</h4>
            <p class="text-gray-600">Kelola produk, pelanggan, dan pantau laporan penjualan *real-time* dari mana saja.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-300 py-10 text-center">
      <p>&copy; {{ new Date().getFullYear() }} TemuPOS. Dibuat dengan 💚 oleh Dika & Tim.</p>
    </footer>
  </div>
</template>

<script>
export default {
  // Komponen ini tidak butuh script khusus
}
</script>
