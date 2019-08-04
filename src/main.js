// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
import router from './router'
import * as socket from './api/websocket'
import ace from 'ace-builds'
import './assets/iconfont/iconfont.css'
import global from '@/store/global'

Vue.prototype.GLOBAL=global   //此处不能直接将变量挂载在原型，因为在其他地方修改只是修改其副本，要想修改原型中的值，只能通过修改引用类型的属性
Vue.prototype.socket = socket
Vue.use(ace)
Vue.use(ElementUI)
Vue.config.productionTip = false
// 路由跳转验证，要写在实例创建之前才能防止直接修改URL可以跳转的问题
// 注册一个全局守卫，作用是在路由跳转前，对路由进行判断，防止未登录的用户跳转到其他需要登录的页面去
router.beforeEach((to, from, next) => {
  // 如果已经登录，可以随便访问
  if(Vue.prototype.GLOBAL.glob_isLogin){
    next()
  }else {
  // 如果没有登录，但你访问其他需要登录的页面，那我就让你跳到登录页面去
    if(to.path !== '/login') {
      next({path: '/login'})
    }else {
      next()
    }
  }
  })
/* eslint-disable no-new */
 let vm = new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>',
    })
