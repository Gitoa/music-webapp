<template>
  <div class='slider' ref='slider'>
    <div class='slider-group' ref='sliderGroup'>
      <slot>
      </slot>
    </div>
    <div class='dots'>
      <span class='dot' v-for='(item, index) in dots' :class='{"active": index===currentPageIndex}'></span>
    </div>
  </div>
</template>

<script>
  import MyScroll from '../../../myscroll/index'
  import {addClass} from 'common/js/dom'

  export default {
    name: 'Slider',
    mounted() {
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()
        this._initSlider()
      }, 20)
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth()
        this.slider.refresh()
      })
    },
    destroyed() {
      clearTimeout(this.timer)
    },
    data() {
      return {
        dots: [],
        currentPageIndex: 0,
      }
    },
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 4000
      }
    },
    methods: {
      _setSliderWidth(isResize) {
        this.children = this.$refs.sliderGroup.children
        let width = 0
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item')
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      _initSlider() {
        this.slider = new MyScroll(this.$refs.slider, {
          direction: 'X',
          loop: this.loop,
          momentum: false,
          autoplay: this.autoPlay
        })
        this.slider.on('scrollEnd', this._onScrollEnd)
      },
      _onScrollEnd() {
        let pageIndex = this.slider.getCurrentPage()
        this.currentPageIndex = pageIndex
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';

  .slider {
    height: 100%;
    position: relative;
    .slider-group {
      overflow: hidden;
      .slider-item {
        float:left;
        a {
          img {
            display: block;
            width: 100%;
          }
        }
      }
    }
    .dots {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 12px;
      text-align: center;
      .dot {
        display: inline-block;
        margin: 0 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: $color-text-l;
        &.active {
          background-color: $color-theme;
        }
      }
    }
  }
</style>