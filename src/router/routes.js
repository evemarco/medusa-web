
const routes = [
  {
    path: '/',
    component: () => import('layouts/Default.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'login', component: () => import('pages/Login.vue') },
      { path: 'logout', component: () => import('pages/Logout.vue') },
      { path: 'callback', component: () => import('pages/Callback.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('layouts/Default.vue'),
    children: [ { path: '', component: () => import('pages/Error404.vue') } ]
    // component: () => import('pages/Error404.vue')
  })
}

export default routes
