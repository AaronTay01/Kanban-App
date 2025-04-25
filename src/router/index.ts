import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import LoginView from '@/components/views/LoginView.vue'
import DashboardView from '@/components/views/DashboardView.vue'
import SignUpView from '@/components/views/SignUpView.vue'
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUpView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

let isAuthResolved = false

const getAuthState = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      isAuthResolved = true
      unsubscribe()
      resolve(true)
    })
  })

router.beforeEach(async (to, from, next) => {
  if (!isAuthResolved) {
    await getAuthState()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const user = auth.currentUser

  if (requiresAuth && !user) {
    next({ path: '/login' })
  } else if ((to.path === '/login' || to.path === '/signup') && user) {
    next({ path: '/dashboard' })
  } else {
    next()
  }
})

export default router
