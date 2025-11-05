<template>
  <!-- 
    src/views/Login.vue
    (REFACTOR BESAR) Ditulis ulang dengan Chakra UI
  -->
  <CBox 
    min-h="100vh" 
    bg="gray.50" 
    d="flex" 
    align-items="center" 
    justify-content="center"
    p="4"
  >
    <CBox 
      w="full" 
      max-w="md" 
      bg="white" 
      p="8" 
      border-radius="xl" 
      shadow="lg"
    >
      <!-- Logo dan Judul -->
      <CBox d="flex" align-items="center" justify-content="center" mb="6">
        <CIcon name="coffee" size="32px" color="green.600" />
        <CHeading as="h1" size="lg" ml="3" font-weight="bold" color="green.700">
          TemuPOS
        </CHeading>
      </CBox>

      <!-- Tab Login / Daftar -->
      <CTabs v-model="tabIndex" is-fitted variant="enclosed-colored" color-scheme="green">
        <CTabList>
          <CTab font-weight="bold">Login</CTab>
          <CTab font-weight="bold">Daftar</CTab>
        </CTabList>
        
        <CTabPanels>
          <!-- Panel Login -->
          <CTabPanel>
            <form @submit.prevent="handleLogin">
              <CStack spacing="4" mt="6">
                
                <!-- (BARU) Tampilkan Error di sini -->
                <CAlert v-if="authError" status="error" border-radius="md">
                  <CAlertIcon />
                  {{ authError }}
                </CAlert>

                <CFormControl is-required>
                  <CFormLabel>Email</CFormLabel>
                  <CInput 
                    v-model="email" 
                    type="email" 
                    placeholder="admin@temupos.com"
                  />
                </CFormControl>

                <CFormControl is-required>
                  <CFormLabel>Password</CFormLabel>
                  <CInputGroup>
                    <CInput 
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="••••••••"
                    />
                    <CInputRightElement>
                      <CButton 
                        h="1.75rem" 
                        size="sm" 
                        @click="showPassword = !showPassword"
                      >
                        {{ showPassword ? 'Hide' : 'Show' }}
                      </CButton>
                    </CInputRightElement>
                  </CInputGroup>
                </CFormControl>

                <CButton 
                  type="submit"
                  color-scheme="green" 
                  size="lg" 
                  font-size="md" 
                  :is-loading="loading"
                  w="full"
                >
                  Login
                </CButton>
              </CStack>
            </form>
          </CTabPanel>

          <!-- Panel Daftar -->
          <CTabPanel>
            <form @submit.prevent="handleSignup">
              <CStack spacing="4" mt="6">

                <!-- (BARU) Tampilkan Error di sini -->
                <CAlert v-if="authError" status="error" border-radius="md">
                  <CAlertIcon />
                  {{ authError }}
                </CAlert>
                
                <CFormControl is-required>
                  <CFormLabel>Nama Lengkap</CFormLabel>
                  <CInput 
                    v-model="form.full_name" 
                    placeholder="Nama Anda"
                  />
                </CFormControl>
                
                <CFormControl is-required>
                  <CFormLabel>Nomor HP</CFormLabel>
                  <CInput 
                    v-model="form.phone" 
                    placeholder="0812..."
                  />
                </CFormControl>

                <CFormControl is-required>
                  <CFormLabel>Jenis Kelamin</CFormLabel>
                  <CRadioGroup v-model="form.gender" d="flex" gap="6">
                    <CRadio value="Laki-laki">Laki-laki</CRadio>
                    <CRadio value="Perempuan">Perempuan</CRadio>
                  </CRadioGroup>
                </CFormControl>
                
                <hr />

                <CFormControl is-required>
                  <CFormLabel>Email</CFormLabel>
                  <CInput 
                    v-model="email" 
                    type="email" 
                    placeholder="email@anda.com"
                  />
                </CFormControl>

                <CFormControl is-required>
                  <CFormLabel>Password</CFormLabel>
                  <CInput 
                    v-model="password"
                    type="password"
                    placeholder="Buat password yang kuat"
                  />
                </CFormControl>

                <CButton 
                  type="submit"
                  color-scheme="blue" 
                  size="lg" 
                  font-size="md" 
                  :is-loading="loading"
                  w="full"
                >
                  Daftar Sekarang
                </CButton>
              </CStack>
            </form>
          </CTabPanel>
        </CTabPanels>
      </CTabs>
    </CBox>
  </CBox>
</template>

<script>
// SEMUA LOGIKA DI SINI SAMA PERSIS, TIDAK BERUBAH
import { ref } from 'vue'
import { supabase } from '../supabaseClient'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const email = ref('')
    const password = ref('')
    const authError = ref(null)
    const tabIndex = ref(0) // 0 = Login, 1 = Daftar
    const showPassword = ref(false)
    
    // Form data untuk pendaftaran
    const form = ref({
      full_name: '',
      phone: '',
      gender: 'Laki-laki'
    })

    // Fungsi untuk login
    const handleLogin = async () => {
      loading.value = true
      authError.value = null
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        })
        if (error) throw error
        router.push({ name: 'Pos' }) // Arahkan ke POS setelah login
      } catch (error) {
        authError.value = 'Email atau password salah: ' + error.message
      } finally {
        loading.value = false
      }
    }

    // Fungsi untuk daftar
    const handleSignup = async () => {
      loading.value = true
      authError.value = null
      try {
        const { error } = await supabase.auth.signUp(
          {
            email: email.value,
            password: password.value,
          },
          {
            // Kirim data tambahan ke tabel 'profiles' via trigger
            data: {
              full_name: form.value.full_name,
              phone: form.value.phone,
              gender: form.value.gender
            }
          }
        )
        if (error) throw error
        
        // Pindah ke tab login dan kasih pesan sukses
        tabIndex.value = 0
        email.value = ''
        password.value = ''
        alert('Daftar berhasil! Silakan cek email untuk verifikasi (jika aktif) dan login.')
        
      } catch (error) {
        authError.value = 'Gagal mendaftar: ' + error.message
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      email,
      password,
      authError,
      tabIndex,
      showPassword,
      form,
      handleLogin,
      handleSignup,
    }
  },
}
</script> 