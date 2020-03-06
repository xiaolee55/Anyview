
import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import('@/pages/Login.vue')
const Work = () => import('@/pages/Work.vue')
const Coding = () => import('@/pages/Coding.vue')
const PersonalCenter = () => import('@/pages/PersonalCenter.vue')
const wrong404 = () => import('@/pages/404.vue')

// 声明使用插件
Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',  
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/work',
      name: 'work',
      component: Work,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/coding',
      name: 'coding',
      component: Coding,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/PersonalCenter',
      name: 'personalCenter',
      component: PersonalCenter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/404',
      component: wrong404
    },
    {
      path: '/',
      component: Login,
      redirect: '/login'   //重定向
    },
    {
      path: '**',   // 错误路由
      redirect: '/404'   //重定向
    },
  ]
})
