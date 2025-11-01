// src/router/index.js
// (UPDATE) Tambahkan rute untuk CMS Pelanggan

import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabaseClient'

// Impor halaman (views)
import Login from '../views/Login.vue'
import Pos from '../views/Pos.vue'
import Admin from '../views/Admin.vue'
import Receipt from '../views/Receipt.vue'

// Impor halaman anak (admin)
import AdminReports from '../views/admin/Reports.vue'
import AdminProducts from '../views/admin/Products.vue'
// (BARU) Impor halaman CMS Pelanggan
import AdminCustomers from '../views/admin/Customers.vue'

const routes = [
  // ... (rute Login, Pos tidak berubah) ...
  { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
  { path: '/', name: 'Pos', component: Pos, meta: { requiresAuth: true } },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        redirect: { name: 'AdminReports' }
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: AdminReports
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: AdminProducts
      },
      // (BARU) Rute untuk CMS Pelanggan
      {
        path: 'customers',
        name: 'AdminCustomers',
        component: AdminCustomers
      }
    ]
  },
  // ... (rute PrintReceipt tidak berubah) ...
  { path: '/print/:id', name: 'PrintReceipt', component: Receipt, meta: { requiresAuth: false } }
]

// ... (const router = createRouter ... tidak berubah) ...
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ... (router.beforeEach guard tidak berubah) ...
// (Salin/tempel kode guard lengkap dari file Anda sebelumnya)
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !user) {
    next({ name: 'Login' });
  } else if (!requiresAuth && user && to.name === 'Login') {
    next({ name: 'Pos' });
  } else if (requiresAdmin) {
    if (!user) {
      next({ name: 'Login' });
      return;
    }
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (error || !profile) {
      console.error('Error mengambil profil:', error);
      await supabase.auth.signOut();
      next({ name: 'Login' });
    } else if (profile.role === 'admin' || profile.role === 'business_owner') {
      next();
    } else {
      alert('Akses ditolak. Hanya untuk Admin.');
      next({ name: 'Pos' });
    }
  } else {
    next();
  }
});


export default router

