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

Vue.prototype.socket = socket
Vue.use(ace)
Vue.use(ElementUI)
Vue.config.productionTip = false
/* eslint-disable no-new */
 let vm = new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>'
    })
