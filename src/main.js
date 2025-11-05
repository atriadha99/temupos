import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// 1. Import Chakra
import Chakra from '@chakra-ui/vue-next'

const app = createApp(App)

app.use(router)
// 2. Daftarkan Chakra ke Vue
app.use(Chakra) 

app.mount('#app')

