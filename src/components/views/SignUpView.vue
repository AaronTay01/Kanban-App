<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        Create an account
      </h2>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="handleSignUp">
          <div class="mt-2">
            <label for="email" class="block text-sm/6 font-medium text-gray-900">
              Email address
            </label>
            <div>
              <input
                type="email"
                id="email"
                v-model="email"
                required
                autocomplete="email"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm/6 font-medium text-gray-900">
              Password
            </label>
            <div class="mt-2">
              <input
                type="password"
                id="password"
                v-model="password"
                required
                autocomplete="new-password"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign up
            </button>
          </div>
        </form>

        <button
          @click.prevent="goBack"
          class="mt-4 flex w-full justify-center rounded-md border border-gray-300 px-3 py-1.5 text-sm/6 font-medium text-gray-700 hover:bg-gray-100"
        >
          Back
        </button>

        <p class="mt-6 text-center text-sm text-gray-600">
          {{ signUpStatus }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUser } from '@/firebase-api/api'
import { createBoardForUser } from '@/utils/board'

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
