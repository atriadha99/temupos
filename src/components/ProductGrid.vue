<template>
  <!-- 
    src/components/ProductGrid.vue
    (REFACTOR) Menggunakan Chakra UI <CBox> & <CSimpleGrid>
  -->
  <CBox>
    <CHeading as="h2" size="lg" mb="4">Daftar Produk</CHeading>
    
    <!-- Loading Skeleton -->
    <CSimpleGrid v-if="loading" columns="3" spacing="4">
      <CBox v-for="n in 6" :key="n" p="4" bg="white" rounded="xl" shadow="md">
        <CSkeleton height="120px" rounded="md" />
        <CSkeleton height="20px" mt="4" />
        <CSkeleton height="16px" mt="2" />
      </CBox>
    </CSimpleGrid>

    <!-- Pesan Belum Ada Produk -->
    <CAlert 
      v-else-if="!loading && products.length === 0" 
      status="info" 
      rounded="lg"
    >
      <CAlertIcon />
      <CBox>
        <CAlertTitle>Belum ada produk.</CAlertTitle>
        <CAlertDescription>
          Admin bisa menambahkan produk di halaman CMS.
        </CAlertDescription>
      </CBox>
    </CAlert>

    <!-- Grid Produk -->
    <CSimpleGrid v-else columns="3" spacing="4">
      <CBox
        v-for="p in products"
        :key="p.id"
        bg="white"
        rounded="xl"
        shadow="md"
        p="4"
        transition="all 0.2s"
        :_hover="{ shadow: 'lg', transform: 'translateY(-2px)' }"
        cursor="pointer"
        @click="$emit('add', p)"
      >
        <CImage
          :src="p.image_url || 'https://placehold.co/150x150/e2e8f0/94a3b8?text=...'"
          :alt="p.name"
          h="120px"
          w="full"
          object-fit="cover"
          rounded="md"
          mb="3"
        />
        <CText font-weight="bold" no-of-lines="1">{{ p.name }}</CText>
        <CText font-size="sm" color="gray.600">
          Rp {{ Number(p.price).toLocaleString('id-ID') }}
        </CText>
      </CBox>
    </CSimpleGrid>
  </CBox>
</template>

<script>
// (SCRIPT TIDAK BERUBAH)
export default {
  props: {
    products: { type: Array, default: () => [] },
    loading: { type: Boolean, default: true }
  },
  emits: ['add']
}
</script>