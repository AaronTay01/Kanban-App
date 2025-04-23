<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">Welcome to the Dashboard</h1>
    <p class="text-gray-700">
      <span v-if="userId">✅ Logged in as: {{ userId }}</span>
      <span v-else>🔄 Loading user info...</span>
    </p>
    <button
      @click="handleLogout"
      class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
    >
      🚪 Logout
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import router from '@/router'
import { logoutUser } from '@/firebase-api/api'

const userId = ref<string | null>(null)

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId.value = user.uid
      console.log('✅ Logged in user ID:', user.uid)
    } else {
      console.warn('❌ No user logged in. You may want to redirect.')
      // Optional redirect
      // import { useRouter } from 'vue-router'
      // const router = useRouter()
      router.push('/login')
    }
  })
})

const handleLogout = async () => {
  const auth = getAuth()
  try {
    await logoutUser()
    console.log('👋 User signed out')
    router.push('/login')
  } catch (err) {
    console.error('❌ Error signing out:', err)
  }
}
</script>
