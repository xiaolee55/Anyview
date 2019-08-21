/*
路由器对象模块
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../pages/Login/Login.vue'
import work from '../pages/work/work.vue'
import Coding from '../pages/Coding/Coding.vue'
import PersonalCenter from '../pages/PersonalCenter/PersonalCenter.vue'
// 声明使用插件
Vue.use(VueRouter)

export default new VueRouter({
  // 所有路由
  routes: [
    {
      path: '/login',
      component: Login, // 返回路由组件的函数, 只有执行此函数才会加载路由组件, 这个函数在请求对应的路由路径时才会执行
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/work',
      name: 'work',
      component: work,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/Coding',
      name: 'Coding',
      component: Coding,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/PersonalCenter',
      name: 'personalCenter',
      component: PersonalCenter
    },
    {
      path: '/',
      component: Login,
      redirect: '/Login'   //重定向
    },
    {
      path: '**',   // 错误路由
      redirect: '/Login'   //重定向
    },
  ]
})
