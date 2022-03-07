<template>
  <div class="container" @viewappear="initPage">
    <div class="bg" v-if="deviceDetail.power">
      <image src="./assets/image/bg.png" class="bg"></image>
    </div>
    <dof-minibar
      :title="deviceInfo.deviceName"
      background-color="transparent"
      textColor="#000000"
      :middle-text-style="headerStyle"
      :is-immersion="true"
      @dofMinibarRightButtonClicked="toSetting"
    >
      <div slot="left">
        <image :src="leftButton" style="height: 55px;width: 55px;transform:translateX(-10px);"></image>
      </div>
      <div slot="right" class="right-img-wrapper">
        <image :src="rightButton" style="height: 55px;width: 55px;"></image>
      </div>
    </dof-minibar>
    <scroller style="align-items: center" @scroll="scrollHander">
      <!-- 提示 -->
      <dof-noticebar
        :notice="waterProtectorText"
        v-if="deviceDetail.waterProtector"
        type="danger"
        mode="closable"
      ></dof-noticebar>
      <dof-noticebar
        :notice="overheatText"
        v-if="deviceDetail.overheatingProtection"
        type="danger"
        mode="closeable"
      ></dof-noticebar>
      <!-- 状态胶囊 -->
      <div class="status-capsule" v-if="deviceDetail.fogMethod !== 'close'">
        <div class="status-point"></div>
        <text class="status-text">{{ statusText }}</text>
      </div>
      <!-- 设备和喷雾 -->
      <image src="./assets/image/spray_on.png" class="sprayIcon" v-if="deviceDetail.fogMethod !== 'close' && deviceDetail.power"></image>
      <image src="./assets/image/spray_off.png" class="sprayIcon" v-if="deviceDetail.fogMethod !== 'close' && !deviceDetail.power"></image>
      <image :src="deviceIcon" class="deviceIcon" :style="{marginTop: deviceDetail.fogMethod === 'close' ? '173px' : 0}"></image>
      <adjust-bar
        :disable="!deviceDetail.power"
        style="margin-top: 104px"
        title="亮度"
        :min-percent="1"
        :percent="Math.round((deviceDetail.brightValue / 255) * 100)"
        @getValue="getBrightValue"
      ></adjust-bar>
      <card-list
        :disable="!deviceDetail.power"
        style="margin-top: 16px"
        title="色温"
        :selected="colorTemperature"
        :cards="colorTemperatureModelArray"
        @selectCard="setColorTemperatureValueModel"
      ></card-list>
      <super-cell
        :disable="!deviceDetail.power"
        style="margin-top: 16px"
        title="呼吸模式"
        icon="./assets/image/breath.png"
        desc="开启后，执行明暗交替的呼吸效果"
        :switch-check="deviceDetail.screenModel !== 'manual'"
        :has-arrow="false"
        @switchChange="setSmokeMode"
      ></super-cell>
      <super-cell
        style="margin-top: 16px"
        icon="./assets/image/scene.png"
        title="智能场景"
        @cellClick="goToScene"
      ></super-cell>
      <div style="width: 750px;height: 200px"></div>
      <dof-bottom-bar
        style="border-radius: 64px"
        :tab-groups="tabs"
        @dofTabItemClicked="tabBarOperateHandler"
      ></dof-bottom-bar>
      <dof-popup
        :height="354"
        :show="showPopup"
        pos="bottom"
        :button="popupButton"
        @dofPopupOverlayClicked="showPopup = false"
        @dofPopupButtonClicked="popupButtonClicked"
      >
        <div class="smokeSlot">
          <div class="smokeItem" v-for="item in smokeArray" :key="item.id" @click="smokeControler(item)">
            <image class="smokeImg" :src="item.icon"></image>
            <text class="smokeText">{{ item.name }}</text>
          </div>
        </div>
      </dof-popup>
    </scroller>
  </div>
</template>
<script>
import { DofMinibar, DofButton, DofCell, DofSwitch, DofBottomBar, DofPopup, DofNoticebar } from 'dolphin-weex-ui'
import base from '../../../mixins/base'
import AdjustBar from '../../../components/adjustBar'
import CardList from '../../../components/cardList'
import SuperCell from '../../../components/superCell'
import superMoreUtil from '../../../util/superMoreUtil'
import debugUtil from '../../../util/debugUtil'
import { Bridge } from 'dolphin-native-bridge'
import { mapState, mapActions, mapMutations } from 'vuex'
import nativeService from '../../../service/nativeService'
const globalEvent = weex.requireModule('globalEvent')

export default {
  mixins: [base],
  components: {
    SuperCell,
    DofMinibar,
    DofButton,
    AdjustBar,
    CardList,
    DofCell,
    DofSwitch,
    DofBottomBar,
    DofPopup,
    DofNoticebar
  },
  data() {
    return {
      showPopup: false,
      isSpray: true,
      statusText: '喷雾中',
      leftButton: './assets/image/header/back_black@2x.png',
      rightButton: './assets/image/more.png',
      popupButton: ['取消'],
      superMoreData: {
        pluginData: {
          hideMaintenance: true,
          version: '0.0.1' // 事业部自定义设备插件版本号，统一使用vX.Y.Z格式，X为大版本，Y为中版本，Z为小版本
        }
      },
      headerStyle: {
        fontFamily: 'PingFangSC-Regular',
        fontWeight: '900',
        fontSize: '36px',
        letterSpacing: 0
      },
      deviceIcon: './assets/image/open.png',
      tabs: [
        {
          type: 'switch',
          title: 'power',
          text: '开关',
          iconColor: '#FFAA10',
          disabled: false,
          icon: './assets/image/light_open.png'
        },
        {
          type: 'mode',
          title: 'smoke',
          text: '喷雾',
          iconColor: '#267AFF',
          disabled: false,
          icon: './assets/image/smoke_close.png'
        }
      ],
      colorTemperatureModelArray: [
        {
          id: 0,
          name: '冷白',
          value: 255
        },
        {
          id: 1,
          name: '暖白',
          value: 127
        },
        {
          id: 2,
          name: '暖黄',
          value: 0
        }
      ],
      smokeArray: [
        {
          id: 0,
          name: '关闭',
          icon: './assets/image/smoke_close.png'
        },
        {
          id: 1,
          name: '持续喷雾',
          icon: './assets/image/smoke_continued.png'
        },
        {
          id: 2,
          name: '间断喷雾',
          icon: './assets/image/smoke_interrupted.png'
        }
      ]
    }
  },
  created() {
    this.initPage()
    Bridge.subscribeMessage({
      deviceId: [this.deviceDetail.deviceId]
    })
      .then(res => {
        debugUtil.log('订阅成功', res)
      })
      .catch(err => {
        debugUtil.log('订阅失败', err)
      })
  },
  mounted() {
    globalEvent.addEventListener('receiveMessage', data => {
      debugUtil.log('收到推送数据', data)
    })
  },
  computed: {
    waterProtectorText() {
      if (this.deviceDetail.waterProtector) {
        return '雾化器缺水，请及时补充'
      } else {
        return ''
      }
    },
    overheatText() {
      if (this.deviceDetail.overheatingProtection) {
        return '设备雾化器过热，已自动关机'
      } else {
        return ''
      }
    },
    colorTemperature() {
      let modelValue = 0
      if (this.deviceDetail.colorTemperatureValue >= 170) {
        modelValue = 255
      } else if (this.deviceDetail.colorTemperatureValue >= 85) {
        modelValue = 127
      } else {
        modelValue = 0
      }
      return this.colorTemperatureModelArray.find(item => item.value === modelValue).id
    },
    ...mapState(['deviceInfo', 'deviceDetail'])
  },
  watch: {
    'deviceDetail.power'(newValue, oldValue) {
      debugUtil.log('watch开关', newValue)
      let newIcon = newValue ? './assets/image/light_open.png' : './assets/image/light_close.png'
      let iconColor = newValue ? '#FFAA10' : '#FFF6E7'
      this.deviceIcon = newValue ? './assets/image/open.png' : './assets/image/close.png'
      this.$set(this.tabs, 0, {
        type: 'switch',
        title: 'power',
        text: '开关',
        iconColor: iconColor,
        disabled: false,
        icon: newIcon
      })
    },
    'deviceDetail.fogMethod'(newValue, oldValue) {
      debugUtil.log('watch喷雾', newValue)
      let newIcon = this.smokeArray[0].icon
      let newText = '关闭'
      switch (newValue) {
        case 'close':
          break
        case 'along':
          newIcon = this.smokeArray[1].icon
          newText = this.smokeArray[1].name
          break
        case 'blink':
          newIcon = this.smokeArray[2].icon
          newText = this.smokeArray[2].name
          break
      }
      this.$set(this.tabs, 1, {
        type: 'mode',
        title: 'smoke',
        text: newText,
        iconColor: '#267AFF',
        disabled: false,
        icon: newIcon
      })
    }
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
    async initPage() {
      debugUtil.log('初始化页面')
      await this.updateDeviceInfo()
      await this.updateDeviceDetail()
      debugUtil.log('设备参数', this.deviceInfo)
      debugUtil.log('设备信息', this.deviceDetail)
    },

    tabBarOperateHandler(e) {
      switch (e.index) {
        case 0:
          this.powerToggle(!this.deviceDetail.power).then(res => {
            if (res.code === '0') {
              nativeService.toast('操作成功')
              let faker = JSON.parse(JSON.stringify(this.deviceDetail))
              faker.power = !this.deviceDetail.power
              this.setDeviceDetail(faker)
            } else {
              nativeService.toast('操作失败')
            }
          })
          break
        case 1:
          this.showPopup = true
      }
    },

    toSetting() {
      superMoreUtil.open(
        {
          deviceId: this.deviceDetail.deviceId,
          pluginData: this.superMoreData.pluginData
        },
        () => {
          debugUtil.log('更多页打开失败！')
        }
      )
    },

    goToScene() {
      const params = {
        type: 'jumpWeex',
        param: {
          url: `https://meiju-scene.smartmidea.net/${weex.config.env.appEnv}/web/plugin-scene-home.js?applianceCode=${this.deviceInfo.deviceId}`, //这里deviceId是插件页对应设备的ID,
          needNavi: '1',
          viewTag: 'plugin-scene-home',
          isCloudWeex: true // 显示页面跳转loading
        }
      } //内部路由跳转参数，固定
      Bridge.goToMeijuPage(params)
    },

    setSmokeMode(e) {
      let param = 'manual'
      if (e) {
        param = 'breath'
      }
      this.setScreenModel(param).then(res => {
        if (res.code === '0') {
          if (e) {
            nativeService.toast('呼吸模式已开启')
          } else {
            nativeService.toast('呼吸模式已中断')
          }
          let faker = JSON.parse(JSON.stringify(this.deviceDetail))
          faker.screenModel = param
          this.setDeviceDetail(faker)
        } else {
          nativeService.toast('操作失败')
        }
      })
    },

    setColorTemperatureValueModel(e) {
      debugUtil.log('调色', e.value)
      this.setColorTemperatureValue(e.value).then(res => {
        if (res.code === '0') {
          nativeService.toast('调节成功')
          let faker = JSON.parse(JSON.stringify(this.deviceDetail))
          faker.colorTemperatureValue = e.value
          this.setDeviceDetail(faker)
        } else {
          nativeService.toast('调节失败')
        }
      })
    },

    popupButtonClicked(e) {
      this.showPopup = false
    },

    smokeControler(item) {
      let model = 'close'
      switch (item.id) {
        case 0:
          break
        case 1:
          model = 'along'
          break
        case 2:
          model = 'blink'
          break
      }
      this.controlFogMethod(model).then(res => {
        if (res.code === '0') {
          nativeService.toast('操作成功')
          let faker = JSON.parse(JSON.stringify(this.deviceDetail))
          faker.fogMethod = model
          this.setDeviceDetail(faker)
          this.showPopup = false
        } else {
          nativeService.toast('操作失败')
        }
      })
    },

    getBrightValue(e) {
      debugUtil.log('拿到百分比', e)
      debugUtil.log('折算', parseInt((255 * e) / 100))
      this.setBrightValue(parseInt((255 * e) / 100)).then(res => {
        if (res.code === '0') {
          nativeService.toast('调节成功')
          let faker = JSON.parse(JSON.stringify(this.deviceDetail))
          faker.brightValue = parseInt((255 * e) / 100)
          this.setDeviceDetail(faker)
        } else {
          nativeService.toast('调节失败')
        }
      })
    },

    scrollHander(e) {
      debugUtil.log('偏移数据', e)
    }
  }
}
</script>
<style scoped>
.container {
  background-color: #f5f5f5;
  align-items: center;
}

.bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.status-capsule {
  width: 178px;
  height: 68px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  background-color: rgba(102, 102, 102, 0.08);
  border-radius: 99999px;
  margin-top: 38px;
}

.status-point {
  height: 14px;
  width: 14px;
  border-radius: 7px;
  background-color: #25CF42;
  margin-right: 16px;
}

.status-text {
  font-family: PingFangSC-Medium;
  font-size: 28px;
  color: #666666;
  letter-spacing: 0;
  text-align: center;
  line-height: 28px;
  font-weight: 700;
}

.sprayIcon {
  width: 160px;
  height: 87px;
  margin-bottom: -5px;
  margin-top: 10px;
}

.deviceIcon {
  width: 275px;
  height: 350px;
}

.cell {
  width: 686px;
  margin-top: 16px;
  border-radius: 32px;
  box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.04);
}

.smokeSlot {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 94px;
  align-items: center;
  height: 240px;
  width: 750px;
}

.smokeImg {
  width: 64px;
  height: 64px;
  background-color: #267aff;
  border-radius: 32px;
  margin-bottom: 24px;
}

.smokeItem {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
