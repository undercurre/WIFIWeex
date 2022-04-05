<template>
  <div class="wrapper">
    <scroller>
      <div ref="body">
        <div style="height: 16px; background-color: #f9f9f9"></div>
        <dof-cell
          title="MAC"
          :has-arrow="false"
          :has-sub-bottom-border="false"
          :right-text="deviceInfo.mac"
          text-color="#000000"
        ></dof-cell>
      </div>
    </scroller>
  </div>
</template>

<script>
import debugUtil from '../../../util/debugUtil'
import { DofCell } from 'dolphin-weex-ui'
const routerModule = weex.requireModule('routerModule')
import superMoreUtil from '@/util/superMoreUtil'
import nativeService from '@/service/nativeService'
import { mapState, mapActions, mapMutations } from 'vuex'
import { Bridge } from 'dolphin-native-bridge'

export default {
  components: {
    DofCell
  },
  data: function() {
    return {

    }
  },
  computed: {
    ...mapState(['deviceInfo', 'deviceDetail'])
  },
  methods: {
    ...mapMutations(['setDeviceDetail']),
    ...mapActions([
      'updateDeviceInfo',
      'updateDeviceDetail',
      'trackEvent',
      'setScreenModel',
      'setBrightValue',
      'setColorTemperatureValue',
      'powerToggle',
      'controlFogMethod'
    ]),
    async init() {
      this.$nextTick(() => {
        superMoreUtil.adjustStyle(this.$refs.body)
      })
    }
  },
  async created() {
    await this.updateDeviceInfo()
    await this.updateDeviceDetail()
    await this.init()
    this.trackEvent({
      event: 'plugin_page_view',
      apptype_name: '香薰灯',
      page_name: '更多',
      refer_name: '插件主页',
    })
  }
}
</script>

<style></style>
