<template>
  <div class="flex min-h-full items-center justify-center px-4 py-12">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="text-center text-2xl font-bold">Create an account</h2>
      </div>

      <form @submit.prevent="handleSignUp" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium">Email address</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            class="mt-1 w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            v-model="password"
            required
            class="mt-1 w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div class="space-y-2">
          <button type="submit" class="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
            Sign up
          </button>
          <button
            @click.prevent="goBack"
            class="w-full rounded border border-gray-400 p-2 text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>
        </div>
      </form>

      <p class="text-center text-sm text-gray-600">{{ signUpStatus }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUser } from '@/firebase-api/api'
import { createBoardForUser } from '@/utils/board'
// import { createBoardForUser } from '@/utils/board'

const email = ref('')
const password = ref('')
const signUpStatus = ref('')
const router = useRouter()

const handleSignUp = async () => {
  if (!email.value || !password.value) {
    signUpStatus.value = 'Please enter both email and password.'
    return
  }

  try {
    const userCredential = await createUser(email.value, password.value)
    if (userCredential.user.uid) {
      signUpStatus.value = `Successfully created user: ${userCredential.user.email}`

      // Optionally: create default board
      await createBoardForUser(userCredential)

      router.push('/login')
    } else {
      signUpStatus.value = 'Sign up failed. Please try again.'
    }
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      signUpStatus.value = 'Email already in use. Please try another.'
    } else if (error.code === 'auth/weak-password') {
      signUpStatus.value = 'Password is too weak. Please choose a stronger password.'
    } else {
      signUpStatus.value = 'An error occurred during sign-up.'
      console.error(error)
    }
    alert(signUpStatus.value)
  }
}

const goBack = () => {
  router.back()
}
</script>
