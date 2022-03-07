<template>
  <div class="container" @click="handleCell">
    <div class="left">
      <image :src="icon" class="icon"></image>
      <div class="text">
        <text class="title">{{ title }}</text>
        <text v-if="desc" class="desc">{{ desc }}</text>
      </div>
    </div>
    <dof-switch :disabled="disable" v-if="!hasArrow" :checked="switchCheck" @dof-change.stop="handleSwitchChange"></dof-switch>
    <image v-if="hasArrow" :src="arrow" style="height: 55px;width: 55px;transform:rotate(180deg);"></image>
    <div class="cover" v-if="disable"></div>
  </div>
</template>

<script>
import { DofSwitch } from 'dolphin-weex-ui'
import debugUtil from "../util/debugUtil";

export default {
  name: "superCell",
  components: {
    DofSwitch
  },
  data() {
    return {
      arrow: './assets/image/header/back_black@2x.png',
    }
  },
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '标题'
    },
    desc: {
      type: String,
      default: false
    },
    switchCheck: {
      type: Boolean,
      default: false
    },
    hasArrow: {
      type: Boolean,
      default: true
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleSwitchChange(e) {
      debugUtil.log('开关点击事件')
      this.$emit('switchChange', !this.switchCheck)
    },
    handleCell(e) {
      debugUtil.log('cell点击事件')
      this.$emit('cellClick')
    }
  }
}
</script>

<style scoped>
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 686px;
  height: 222px;
  border-radius: 32px;
  background-color: rgba(255, 255, 255, 0.4);
}

.container {
  width: 686px;
  height: 160px;
  background-color: #FFFFFF;
  border-radius: 32px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 48px 32px;
}

.icon {
  width: 64px;
  height: 64px;
}

.left {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.text {
  margin-left: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  font-size: 32px;
  color: #333333;
  line-height: 32px;
  font-weight: 500;
}

.desc {
  margin-top: 24px;
  font-size: 24px;
  color: #8A8A8F;
  line-height: 24px;
  font-weight: 400;
}
</style>
