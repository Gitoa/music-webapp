<template>
  <transition name='popup-fade'>
    <div class='popup' v-show='showFlag'>
      <div class='text-wrapper'>
        <p class='popup-message'>{{message}}</p>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    data() {
      return {
        showFlag: false,
      }
    },
    props: {
      message: {
        type: String,
        default: '出错了～'
      }
    },
    mounted() {
      this.$root.bus.$on('network-error-show', () => {
        this.show()
      })
    },
    methods: {
      show() {
        if (this.hideTimer) {
          clearTimeout(this.hideTimer)
          this.hideTimer = null
          this.hide()
        }
        setTimeout(() => {
          this.showFlag = true
        }, 30)
        this.hideTimer = setTimeout(() => {
          this.hide()
          this.hideTimer = null
        }, 2000)
      },
      hide() {
        this.showFlag = false
      }
    }
  }
</script>

<style scoped lang='scss'>
  @import '~common/scss/variable';
  .popup {
    position: fixed;
    bottom: 80px;
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    .text-wrapper {
      padding: 10px;
      border-radius:5px;
      background-color: #ccc;
      color: #fff;
      .popup-message {
        font-size: $font-size-small;
      }
    }
  }
  .popup-fade-enter-active {
    transition: opacity 0.3s, transform 0.3s;
  }
  .popup-fade-enter {
    opacity: 0;
    transform: translateY(80px);
  }
  .popup-fade-leave-active {
    transition: opacity 0.5s;
  }
  .popup-fade-leave-to {
    opacity: 0;
  }
</style>