import './assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

import App from './App.vue'
import router from './router'
import { setSessionExpiredHandler } from './services/api'
import { useUserStore } from './stores/user'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

// When the server rejects our token mid-session, go back to the login page.
setSessionExpiredHandler(() => {
  useUserStore().logout()
  if (router.currentRoute.value.matched.some((route) => route.path === '/dashboard')) {
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
  }
})

app.mount('#app')
