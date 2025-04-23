<template>
  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <div>
        <h2 class="text-center text-2xl font-bold text-gray-900">Sign in to your account</h2>
      </div>

      <div>
        <form @submit.prevent="login">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-900">Email address</label>
            <div>
              <input
                type="email"
                id="email"
                v-model="email"
                autocomplete="email"
                required
                class="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium text-gray-900">Password</label>
              <div class="text-sm">
                <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500"
                  >Forgot password?</a
                >
              </div>
            </div>
            <div>
              <input
                type="password"
                id="password"
                v-model="password"
                autocomplete="current-password"
                required
                class="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500">
          Not a member?
          <a href="/Signup" class="font-semibold text-indigo-600 hover:text-indigo-500"
            >Register?</a
          >
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/firebase-api/api'

const email = ref('')
const password = ref('')
const remember = ref(false)

const router = useRouter()

const login = async () => {
  try {
    const user = await loginUser(email.value, password.value)
    console.log('Logged in as:', user)

    await router.push('/dashboard')
  } catch (err) {
    console.error('Login error:', err)
    alert('Invalid email or password')
  }
}
</script>
