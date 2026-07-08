import { createRouter, createWebHashHistory } from 'vue-router'
const layout = () => import('@/layout/index.vue')
const dashboard = () => import('@/view/dashboard/index.vue')
const home = () => import('@/view/home/index.vue')
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: layout,
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          component: dashboard,
          meta: {
            title: 'Dev Desk'
          }
        },
        {
          path: '/home',
          component: home,
          meta: {
            title: '用户管理'
          }
        }
      ]
    }
  ]
})
