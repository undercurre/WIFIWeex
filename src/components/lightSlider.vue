<!--调光调色滑动条-->
<template>
  <div class="bar">
    <div
      class="slider-outer-bar"
      :style="sliderOuterBarStyle"
      ref="outer-bar"
      @touchend="clickHandler"
      @touchstart="blockStartHandler"
      :prevent-move-event="true"
      :bubble = "false"
    >
      <div :prevent-move-event="true" class="slider-inner-bar" :style="sliderInnerBarStyle" ref="inner-bar"></div>
      <div :prevent-move-event="true" class="slider-inner-block" ref="inner-block" :style="sliderInnerBlock"></div>
    </div>
  </div>
</template>

<script>
import Binding from 'weex-bindingx';
import debugUtil from "../util/debugUtil"
export default {
  data() {
    return {
      sliderInnerBartranslateY: 0,    //灰色快移动位移
      innerBlockY: 0,     //白色相对胶囊的高度
      sliderOuterBarStyle: {},
      sliderInnerBarStyle: {},
      sliderInnerBlock: {},
      isCanClick: true,
      valuePrecent: ''    //百分比数值
    };
  },
  props: {
    title: {
      //滑动条高度
      type: String,
      default: '亮度'
    },
    height: {
      //滑动条高度
      type: Number,
      default: 492
    },
    width: {
      //滑动条宽度
      type: Number,
      default: 200
    },
    blockHeight: {
      //白色block高度
      type: Number,
      default: 8
    },
    blockWidth: {
      //白色block宽度
      type: Number,
      default: 84
    },
    topColor: {
      //渐变颜色上部
      type: String,
      default: '#ffaa10'
    },
    bottomColor: {
      //渐变颜色下部
      type: String,
      default: '#5cccff'
    },
    currentValue: {
      //初始值
      type: Number,
      default: 100
    },
    minValue: {
      //最小值
      type: Number,
      default: 0
    },
    maxValue: {
      //最小值
      type: Number,
      default: 100
    },
    minPercent: {
      // 能调节的最小百分比
      type: Number,
      default: 0
    }
  },
  watch: {
    currentValue() {
      this.initValue();
    }
  },
  created() {
    this.initValue();
  },
  mounted() {
    this.outerBar = this.$refs['outer-bar'];
    this.innerBar = this.$refs['inner-bar'];
    this.innerBlock = this.$refs['inner-block'];
    // 是否支持expresstionBinding
    if (Binding.isSupportBinding && Binding.prepare) {
      this.outerBar &&
      Binding.prepare({
        anchor: this.outerBar.ref,
        eventType: 'pan'
      });
    }
  },
  methods: {
    initValue() {
      // 初始化值
      this.sliderInnerBartranslateY = -(this.height * (this.currentValue / 100));
      this.valuePrecent = (Math.abs(this.sliderInnerBartranslateY) / this.height).toFixed(4); //组件滑动的百分比

      this.innerBlockY = this.height * (1 - this.currentValue / 100);
      this.sliderOuterBarStyle = {
        width: `${this.width}px`,
        height: `${this.height}px`,
        backgroundImage: `linear-gradient(to bottom, ${this.topColor}, ${this.bottomColor})`,
        borderRadius: `${this.width / 2}px`
      };
      this.sliderInnerBarStyle = {
        transform: `translateY(${this.sliderInnerBartranslateY}px)`,
        height: `${this.height}px`,
        width: `${this.width}px`
      };
      this.sliderInnerBlock = {
        width: `${this.blockWidth}px`,
        height: `${this.blockHeight}px`,
        borderRadius: `${this.blockHeight / 2}px`,
        transform: `translateY(${this.innerBlockY}px)`, //白色块位移-->  -this.innerBlockY???
        left: `${(this.width - this.blockWidth) / 2}px`,
        top: `${-(this.blockHeight / 2)}px`
      };
    },

    moveHandler(e) {
      debugUtil.log('touchmove');
      // e.preventDefault();
      // e.stopPropagation();
    },
    // touchstart
    blockStartHandler(e) {
      // debugUtil.log('touchstart');
      // e.preventDefault();
      // e.stopPropagation();
      let that = this;
      const gesTokenObj = Binding.bind(
        {
          anchor: that.outerBar.ref,
          eventType: 'pan',
          props: [
            {
              element: that.innerBar.ref,
              property: 'transform.translateY',
              expression: `y+${that.sliderInnerBartranslateY}<0?max(-${that.height},y+${that.sliderInnerBartranslateY}):min(0,y+${that.sliderInnerBartranslateY})`
            },
            {
              element: that.innerBlock.ref,
              property: 'transform.translateY',
              expression: `y+${that.innerBlockY}>${that.height}?min(${that.height},y+${that.innerBlockY}):max(0,y+${that.innerBlockY})`
            }
          ]
        },
        (e) => {
          if (e.state === 'end' || e.state === 'cancel' || e.state === 'exit') {
            debugUtil.log('e.state', e.state);
            if (e.state === 'end' || e.state === 'cancel') {
              // 修改灰色位移
              that.sliderInnerBartranslateY = e.deltaY + that.sliderInnerBartranslateY;
              /**限制灰色div位移 */
              if (that.sliderInnerBartranslateY > (that.minPercent / 100 * that.height)) {
                that.sliderInnerBartranslateY = (that.minPercent / 100 * that.height);
              }
              if (that.sliderInnerBartranslateY < -that.height) {
                that.sliderInnerBartranslateY = -that.height;
              }
              /**限制灰色div位移 */
              // 修改白色框位移
              that.innerBlockY = e.deltaY + that.innerBlockY;
              /**限制白色div位移 */
              if (that.innerBlockY > that.height) {
                that.innerBlockY = that.height;
              }
              if (that.innerBlockY < 0) {
                that.innerBlockY = 0;
              }
              /**限制白色div位移 */
              debugUtil.log('that.sliderInnerBartranslateY', that.sliderInnerBartranslateY);
              that.valuePrecent = (Math.abs(that.sliderInnerBartranslateY) / that.height).toFixed(4); //组件滑动的百分比
              let resValue = Math.ceil((that.maxValue - that.minValue) * that.valuePrecent); //用最大值和最小值计算后的实际值
              debugUtil.log('组件百分比', resValue);
              // 发送给父组件
              this.$emit('getValue', resValue);
              /**滑动后会触发touchend */
              if (e.deltaY != 0) {
                //移动距离不为0，说明是滑动，禁止点击
                that.isCanClick = false;
                let timer = setTimeout(() => {
                  that.isCanClick = true;
                  timer && clearTimeout(timer);
                }, 200);
              }
            }
          }
        }
      );
      this.gesToken2 = gesTokenObj.token;
      e.stopPropagation();
    },
    //  touchend
    // clickHandler(e) {
    //   e.stopPropagation();
    //   debugUtil.log('触发点击', this.isCanClick);
    //   if (!this.isCanClick) {
    //     return;
    //   }
    //   let moveY = e.changedTouches[0].pageY > this.height ? this.height : e.changedTouches[0].pageY; //点击位置距离顶部的距离

    //   this.sliderInnerBartranslateY = moveY - this.height; //计算灰色div要移动的距离
    //   this.sliderInnerBarStyle = {
    //     //修改样式
    //     transform: `translateY(${this.sliderInnerBartranslateY}px)`,
    //     height: `${this.height}px`,
    //     width: `${this.width}px`
    //   };
    //   debugUtil.log('点击moveY', moveY);

    //   this.innerBlockY = moveY; //计算白色div要移动的距离
    //   this.sliderInnerBlock.transform = `translateY(${this.innerBlockY}px)`;
    //   e.stopPropagation();
    // }
  }
};
</script>

<style scoped>
.bar {
  justify-content: space-around;
  align-items: center;
}
.title {
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title-key {
  text-align: center;
  font-size: 28px;
  color: #000000;
  line-height: 28px;
  font-weight: 400;
  margin-bottom: 10px;
  margin-top: 10px;
}
.title-value {
  text-align: center;
  font-size: 48px;
  text-align: center;
  line-height: 48px;
  font-weight: 500;
  margin-bottom: 10px;
  margin-top: 10px;
}
.slider-outer-bar {
  position: relative;
  overflow: hidden;
}
.slider-inner-bar {
  background-color: #e7e7e7;
}
.slider-inner-block {
  background-color: #ffffff;
  position: absolute;
}
</style>
