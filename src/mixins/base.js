import nativeService from 'src/service/nativeService'
import debugUtil from 'src/util/debugUtil'
import { DofMinibar } from 'dolphin-weex-ui'

const appDataTemplate = {}
const bundleUrl = weex.config.bundleUrl
const match = /.*\/(T0x.*)\//g.exec(bundleUrl)
const plugin_name = match ? match[1] : 'common' //appConfig.plugin_name
const srcFileName = bundleUrl.substring(bundleUrl.lastIndexOf('/') + 1, bundleUrl.lastIndexOf('.js'))
const globalEvent = weex.requireModule('globalEvent')
const storage = weex.requireModule('storage')
const appDataChannel = new BroadcastChannel(plugin_name + 'appData')
const pushDataChannel = new BroadcastChannel(plugin_name + 'pushData')

export default {
  components: {
    DofMinibar
  },
  data: () => ({
    title: '',
    isIos: weex.config.env.platform == 'iOS' ? true : false,
    srcFileName: srcFileName,
    pluginVersion: '1.0.0',
    pluginName: plugin_name,
    isMixinCreated: true,
    isNavigating: false,
    appDataKey: plugin_name + 'appData',
    appDataChannel: appDataChannel,
    pushKey: 'receiveMessage',
    pushDataChannel: pushDataChannel,
    appData: appDataTemplate
  }),
  computed: {
    pageHeight() {
      return (750 / weex.config.env.deviceWidth) * weex.config.env.deviceHeight
    },
    isImmersion: function() {
      let result = true
      if (weex.config.env.isImmersion == 'false') {
        result = false
      }
      return result
    },
    isipx() {
      return (
        weex &&
        (weex.config.env.deviceModel === 'iPhone10,3' ||
        weex.config.env.deviceModel === 'iPhone10,6' || //iphoneX
        weex.config.env.deviceModel === 'iPhone11,8' || //iPhone XR
        weex.config.env.deviceModel === 'iPhone11,2' || //iPhone XS
          weex.config.env.deviceModel === 'iPhone11,4' ||
          weex.config.env.deviceModel === 'iPhone11,6') //iPhone XS Max
      )
    }
  },
  created() {
    console.log('created')
  },
  methods: {
    viewappear() {},
    viewdisappear() {
      debugUtil.resetDebugLog()
    },
    getParameterByName: function(name) {
      let url = this.$getConfig().bundleUrl
      name = name.replace(/[\[\]]/g, '\\$&')
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url)
      if (!results) return null
      if (!results[2]) return ''
      return decodeURIComponent(results[2].replace(/\+/g, ' '))
    },
    goTo(pageName, options = {}, params) {
      if (!this.isNavigating) {
        this.isNavigating = true
        // ?????????????????????????????????
        nativeService.setItem(this.appDataKey, this.appData, () => {
          //????????????
          var path = pageName + '.js'
          if (params) {
            path +=
              '?' +
              Object.keys(params)
                .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
                .join('&')
          }
          options.viewTag = pageName
          nativeService.goTo(path, options)
          setTimeout(() => {
            this.isNavigating = false
          }, 500)
        })
      }
    },
    back() {
      //???????????????
      nativeService.goBack()
    },
    exit() {
      nativeService.backToNative()
    },
    getAppData() {
      //????????????????????????
      return new Promise((resolve, reject) => {
        nativeService.getItem(this.appDataKey, resp => {
          let data
          if (resp.result == 'success') {
            data = resp.data
            if (typeof data == 'string') {
              try {
                data = JSON.parse(data)
              } catch (error) {}
            }
          }
          if (!data) {
            data = this.appData
          }
          resolve(data)
        })
      })
    },
    updateAppData(data) {
      //????????????????????????
      this.appData = Object.assign(this.appData, data)
      appDataChannel.postMessage(this.appData)
    },
    resetAppData() {
      //????????????????????????
      return new Promise((resolve, reject) => {
        nativeService.removeItem(this.appDataKey, resp => {
          this.appData = JSON.parse(JSON.stringify(appDataTemplate))
          appDataChannel.postMessage(this.appData)
          resolve()
        })
      })
    },
    handleNotification(data) {
      //??????????????????
      debugUtil.debugLog(srcFileName, this.pushKey, data)
    },
    reload() {
      nativeService.reload()
    }
  }
}
