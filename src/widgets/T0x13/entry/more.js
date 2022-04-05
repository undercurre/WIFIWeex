import App from 'src/widgets/T0x13/views/more.vue'
import dolphinweex from 'src/js/dolphinweex.js'
import exceptionReport from '@/js/exceptionReport.js'
import store from 'src/widgets/T0x13/store/index'

Vue.use(dolphinweex)
Vue.use(exceptionReport)

new Vue({
  el: '#root',
  store,
  render: h => h(App)
})
