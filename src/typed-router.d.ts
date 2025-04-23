import 'vue-router'

declare module 'vue-router' {
  // Declare your route types here
  interface RouteMeta {
    // Example of custom meta fields
    requiresAuth: boolean
  }
}
