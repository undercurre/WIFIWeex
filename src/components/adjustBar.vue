<template>
  <div class="container">
    <div class="title">
      <text class="titleText">{{ title }}</text><text class="line">|</text><text class="titleText">{{ percent }}%</text>
    </div>
    <div @touchend="handleEnd" @touchmove="handleMove" style="padding-top: 32px">
      <div class="progress" ref="touchBox" @touchstart="handleStart">
        <dof-progress :value="percent" bar-width="622" :bar-color="barColor" bar-height="40" bar-radius="20"></dof-progress>
        <div class="point" :style="{ left: (percent / 100) * 622 - 32 + 'px' }"></div>
      </div>
      <div class="percent">
        <text class="text">{{ minPercent }}%</text>
        <text class="text">{{ maxPercent }}%</text>
      </div>
    </div>
    <div class="cover" v-if="disable"></div>
  </div>
</template>

<script>
import { DofProgress } from 'dolphin-weex-ui'
import BindingX from 'weex-bindingx'

export default {
  name: 'adjustBar',
  components: {
    DofProgress
  },
  props: {
    title: {
      type: String,
      default: '标题'
    },
    percent: {
      type: Number,
      default: 60
    },
    maxPercent: {
      type: Number,
      default: 100
    },
    minPercent: {
      type: Number,
      default: 0
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      barColor: '#FFAA10'
    }
  },
  watch: {
    disable(val) {
      if (!val) {
        this.barColor = '#FFAA10'
      } else {
        this.barColor = '#C1C1C1'
      }
    }
  },
  methods: {
    handleStart(e) {
      if (!this.disable) {
        this.setValue(e)
      }
    },
    handleMove(e) {
      if (!this.disable) {
        this.setValue(e)
      }
    },
    handleEnd(e) {
      if (!this.disable) {
        this.$emit('getValue', this.percent)
      }
    },
    setValue(e) {
      let info = '';
      if (Array.isArray(e.changedTouches)) {
        e.changedTouches.forEach(item => {
          info += item.pageX
        })
      }
      if (info < this.minPercent * 622 / 100) {
        info = this.minPercent * 622 / 100
      }
      if (info > 622) {
        info = 622
      }
      this.percent = parseInt(info / 622 * 100)
    }
  }
}
</script>

<style scoped>
.container {
  width: 686px;
  height: 222px;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background-color: #ffffff;
  box-shadow: 0px 2px 20px 0px rgba(0,0,0,0.04);
  border-radius: 32px;
}

.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 686px;
  height: 222px;
  border-radius: 32px;
  background-color: rgba(255, 255, 255, 0.4);
}

.title {
  display: flex;
  flex-direction: row;
}

.titleText {
  height: 32px;
  line-height: 32px;
  font-size: 32px;
  font-weight: 500;
}

.line {
  font-size: 32px;
  height: 32px;
  line-height: 32px;
  margin: 0 14px;
  color: #8A8A8F;
}

.progress {
  position: relative;
}

.point {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  top: 8px;
  background-color: #FFFFFF;
}

.percent {
  width: 630px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 16px;
}

.text {
  font-size: 20px;
  color: #8A8A8F;
}
</style>
