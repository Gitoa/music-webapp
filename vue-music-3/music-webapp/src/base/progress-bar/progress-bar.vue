<template>
  <div class='progress-bar'>
    <div class='bar-inner' ref='bar' @click='click'>
      <div class='progress' ref='progress'></div>
      <div class='progress-btn-wrapper' ref='progressBtn' >
        <div class='progress-btn' @touchstart.prevent='progressTouchStart' @touchmove.prevent='progressTouchMove' @touchend.prevent='progressTouchEnd'></div>
      </div>
    </div>  
  </div>
</template>

<script>
  import {prefixStyle} from 'common/js/dom'

  const transform = prefixStyle('transform')
  const progressBtnWidth = 16

  export default {
    props: {
      percent: {
        type: Number,
        default: 0,
      }
    },
    computed: {
    },
    created() {
      this.touch = {}
    },
    methods: {
      click(e) {
        let progressX = e.offsetX
        this._offset(progressX)
        this._triggerPercent()
      },
      progressTouchStart(e) {
        this.touch.initiated = true
        this.touch.startX = e.touches[0].pageX
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX
        const offsetWidth = Math.min(this.$refs.bar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX)) 
        this._offset(offsetWidth)
      },
      progressTouchEnd() {
        this._triggerPercent()
        this.touch.initiated = false
      },
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      },
      _triggerPercent() {
        const progressX = this.$refs.progress.clientWidth
        const totalProgress = this.$refs.bar.clientWidth - progressBtnWidth
        const percent = progressX / totalProgress
        this.$emit('percentChange', percent)
      }
    },
    watch: {
      percent(newVal) {
        if (!this.touch.initiated && newVal >= 0) {
          const width = this.$refs.bar.clientWidth - progressBtnWidth
          let offsetWidth = width * newVal
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';
  @import '~common/scss/mixin';

  .progress-bar {
    height: 30px;
    position: relative;
    .bar-inner {
      width: 100%;
      height: 4px;
      background-color: $color-text-g;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      .progress {
        position: absolute;
        left: 0;
        height: 100%;
        background: $color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        width: 30px;
        height: 30px;
        left: -8px;
        top: -13px;
        .progress-btn {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: solid 3px #2e3030;
          border-radius: 50%;
          background: $color-theme;

        }
      }
    }
  }
</style>