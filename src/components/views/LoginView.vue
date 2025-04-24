<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="login">
          <div class="mt-2">
            <label for="email" class="block text-sm/6 font-medium text-gray-900"
              >Email address</label
            >
            <div>
              <input
                type="email"
                id="email"
                v-model="email"
                autocomplete="email"
                required
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm/6 font-medium text-gray-900"
                >Password</label
              >
              <div class="text-sm">
                <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500"
                  >Forgot password?</a
                >
              </div>
            </div>
            <div class="mt-2">
              <input
                type="password"
                id="password"
                v-model="password"
                autocomplete="current-password"
                required
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div class="flex items-center">
            <input
              id="remember"
              type="checkbox"
              v-model="remember"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label for="remember" class="ml-2 block text-sm text-gray-900"> Remember me </label>
          </div>

          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500">
          Not a member?
          <a href="/Signup" class="font-semibold text-indigo-600 hover:text-indigo-500">Register</a>
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/firebase-api/api'
import { browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth'
import { auth } from '@/firebase'

const email = ref('')
const password = ref('')
const remember = ref(false)

const router = useRouter()

const login = async () => {
  try {
    // Set persistence based on checkbox
    await setPersistence(auth, remember.value ? browserLocalPersistence : browserSessionPersistence)

    const user = await loginUser(email.value, password.value)
    console.log('Logged in as:', user)

    await router.push('/dashboard')
  } catch (err) {
    console.error('Login error:', err)
    alert('Invalid email or password')
  }
}
</script>
