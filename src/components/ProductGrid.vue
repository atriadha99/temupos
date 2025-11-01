<!-- 
  src/components/ProductGrid.vue
  Komponen untuk menampilkan produk di POS (Fase 2)
-->
<template>
  <div>
    <h2 class="text-xl font-bold mb-4">Daftar Produk</h2>
    
    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <!-- Placeholder Skeleton -->
      <div v-for="n in 8" :key="n" class="bg-white rounded-xl shadow p-4 animate-pulse">
        <div class="w-full h-24 bg-gray-200 rounded-lg mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    
    <!-- Data Kosong -->
    <div v-else-if="products.length === 0" class="bg-white rounded-xl shadow p-10 text-center">
      <p class="font-medium text-gray-700">Belum ada produk.</p>
      <p class="text-sm text-gray-500">Admin bisa menambahkan produk di halaman CMS.</p>
    </div>

    <!-- Grid Produk -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="p in products"
        :key="p.id"
        class="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer p-4 text-center flex flex-col"
        @click="$emit('add', p)"
      >
        <img 
          :src="p.image_url || 'https://placehold.co/150x150/e2e8f0/94a3b8?text=...'" 
          :alt="p.name" 
          class="w-full h-24 object-cover rounded-lg mb-2"
          loading="lazy"
        />
        <div class="flex-1 flex flex-col justify-between">
          <p class="font-medium leading-tight">{{ p.name }}</p>
          <p class="text-sm text-gray-600 mt-1">Rp {{ Number(p.price).toLocaleString('id-ID') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['products', 'loading'],
  emits: ['add']
}
</script>

