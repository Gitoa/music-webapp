import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/index'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'

import 'common/scss/index.scss'

fastclick.attach(document.body)

Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
})

Vue.config.productionTip = false

/* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
  data: {
    bus: new Vue()
  }
})

window.addEventListener('load', () => {

  console.log('onload')

  if ('serviceWorker' in navigator) {

    console.log('register sw')

    navigator.serviceWorker.register('sw.js').then(function(reg) {
  
      console.log(reg)
  
    }).catch(function(error) {
      // registration failed
      console.log('Registration failed with ' + error);
    });
  }
})

window.addEventListener('online', () => {
  //当网络状态切换时，应用不同的样式
  console.log('offline -> online')
})

window.addEventListener('offline', () => {
  console.log('online -> offline')
})
