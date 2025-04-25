import { createUser } from '../firebase-api/api'

// Define the missing function
async function createTestUserWithBoard() {
  const email = 'testuser123@gmail.com'
  const password = 'testuser123'
  try {
    const userCredential = await createUser(email, password)
    if (userCredential) {
      console.log(`Successfully created user: ${userCredential.user.email}`)
    } else {
      console.log('Sign up failed. Please try again.')
    }
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Email already in use. Please try another.')
    } else if (error.code === 'auth/weak-password') {
      console.log('Password is too weak. Please choose a stronger password.')
    } else {
      console.log('An error occurred during sign-up.')
      console.error(error)
    }
  }
}

createTestUserWithBoard().finally(() => console.log('🏁 Test setup done'))
